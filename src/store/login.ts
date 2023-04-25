import { Web3Provider } from "@ethersproject/providers";
import { ChainId } from "@biconomy-sdk-dev/core-types";
import SocialLogin from "@biconomy-sdk-dev/web3-auth";
import SmartAccount from "@biconomy-sdk-dev/smart-account";
import { atom } from "jotai";
import { ethers } from "ethers";
import { SiweMessage } from "siwe";

import { trpcJotai } from "@/utils/trpc";
import toChecksumAddress from "@/lib/toChecksumAddr";
import { loginModeAtom, authAtom } from "@/store/auth";

export const socialLoginAtom = atom(async () => {
  const sdk = new SocialLogin();
  let whitelistUrls: { [x: string]: string } = {};
  if (!!process.env.NEXT_PUBLIC_SITE_URL) {
    const sig = await sdk.whitelistUrl(process.env.NEXT_PUBLIC_SITE_URL);
    whitelistUrls[process.env.NEXT_PUBLIC_SITE_URL] = sig;
  }
  if (!!process.env.NEXT_PUBLIC_VERCEL_URL) {
    const url = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    const sig = await sdk.whitelistUrl(url);
    whitelistUrls[url] = sig;
  }
  await sdk.init({ whitelistUrls, chainId: ethers.utils.hexValue(80001) });
  return sdk;
});

const walletAtom = atom(async (get) => {
  console.log("running walletAtom");
  const mode = get(loginModeAtom);
  if (mode !== "interactive") {
    console.log("running walletAtom stopped with mode", mode);
    return undefined;
  }
  console.log("running walletAtom", mode);
  const socialLogin = await get(socialLoginAtom);
  if (!socialLogin.provider) {
    socialLogin.showWallet();
  }
  while (!socialLogin.provider) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  socialLogin.hideWallet();
});

export const providerAndAccountAtom = atom(async (get) => {
  console.log("getting providerAndAccountAtom");
  const mode = get(loginModeAtom);
  if (mode === "stopped") {
    console.log("getting providerAndAccountAtom stopped, returning");
    return undefined;
  }
  console.log("running providerAndAccountAtom", mode);
  const socialLogin = await get(socialLoginAtom);
  while (!socialLogin.provider) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  const web3Provider = new Web3Provider(socialLogin.provider);
  const accounts = await web3Provider.listAccounts();
  return { provider: web3Provider, account: accounts[0] };
});

export const smartAccountAtom = atom(async (get) => {
  console.log("getting smartAccountAtom");
  const mode = get(loginModeAtom);
  if (mode === "stopped") {
    console.log("getting smartAccountAtom stopped, returning");
    return undefined;
  }
  console.log("getting smartAccountAtom", mode);
  const provider = await get(providerAndAccountAtom);
  if (!provider) return undefined;
  console.log("getting smartAccountAtom have provider");
  const smartAccount = new SmartAccount(provider.provider, {
    // TODO: Figure out what chain this should be.
    activeNetworkId: ChainId.GOERLI,
    supportedNetworksIds: [ChainId.GOERLI],
  });
  await smartAccount.init();
  const context = smartAccount.getSmartAccountContext();
  return {
    smartAccount,
    smartAccountWalletAddress: context.baseWallet.getAddress(),
  };
});

export const logoutAtom = atom(null, async (get, set) => {
  // console.log("running logoutAtom");
  const socialLogin = await get(socialLoginAtom);
  socialLogin.hideWallet();
  await socialLogin.logout();
  await set(trpcJotai.auth.logout.atomWithMutation(), []);
  set(loginModeAtom, "stopped");
});

// export const loginAtom = atom(null, async (get, set) => {
//   // console.log("running loginAtom");
//   set(loginModeAtom, "interactive");
//   await get(walletAtom);
// });

export const loginAtom = atom(null, async (get, set) => {
  set(loginModeAtom, "interactive");
  get(walletAtom);
  console.log("starting auth sequence");
  const isAuthed = await get(authAtom);
  if (isAuthed) {
    console.log("already authenticated");
    return;
  }
  console.log("getting provider for auth");
  const provider = await get(providerAndAccountAtom);
  if (!provider) return;
  console.log("got provider for auth, signing message");
  const signer = provider.provider.getSigner();
  const rawMessage = new SiweMessage({
    domain: window.location.host,
    address: toChecksumAddress(await signer.getAddress()),
    statement:
      "Sign in to Studio with your wallet address. This only requires a signature, no transaction will be sent.",
    uri: origin,
    version: "1",
    chainId: await signer.getChainId(),
    nonce: await get(trpcJotai.auth.nonce.atomWithQuery()),
  });
  const message = rawMessage.prepareMessage();
  const signature = await signer.signMessage(message);
  const res = await set(trpcJotai.auth.login.atomWithMutation(), [
    { message, signature },
  ]);
  set(authAtom, res);
  console.log("authenticated", res);
});
