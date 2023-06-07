import { ChainId } from "@biconomy/core-types";
import SmartAccount from "@biconomy/smart-account";
import SocialLogin from "@biconomy/web3-auth";
import { Web3Provider } from "@ethersproject/providers";
import { ethers } from "ethers";
import { atom } from "jotai";
import { SiweMessage } from "siwe";

import toChecksumAddress from "@/lib/toChecksumAddr";
import { trpcJotai } from "@/utils/trpc";

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

const ticker = atom(0);

export const providerAndAccountAtom = atom(async (get) => {
  get(ticker);
  const socialLogin = await get(socialLoginAtom);
  while (!socialLogin.provider) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  const web3Provider = new Web3Provider(socialLogin.provider);
  const accounts = await web3Provider.listAccounts();
  return { provider: web3Provider, account: accounts[0] };
});

const showWalletAtom = atom(null, async (get) => {
  let open = false;
  const closeButton = document.querySelector("div.w3a-modal__header button");
  closeButton?.addEventListener(
    "click",
    () => {
      open = false;
    },
    { once: true }
  );
  const socialLogin = await get(socialLoginAtom);
  if (!socialLogin.provider) {
    socialLogin.showWallet();
    open = true;
  }
  while (!socialLogin.provider && open) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  socialLogin.hideWallet();
});

export const smartAccountAtom = atom(async (get) => {
  const provider = await get(providerAndAccountAtom);
  const smartAccount = new SmartAccount(provider.provider, {
    // TODO: Figure out what chain this should be.
    activeNetworkId: ChainId.POLYGON_MUMBAI,
    supportedNetworksIds: [ChainId.POLYGON_MUMBAI],
    networkConfig: [
      {
        chainId: ChainId.POLYGON_MUMBAI,
        dappAPIKey: process.env.MATMICMUM_PAYMASTER_API_KEY,
      },
      {
        chainId: ChainId.ARBITRUM_NOVA_MAINNET,
        dappAPIKey: process.env.ARBITRUM_NOVA_PAYMASTER_API_KEY,
      },
    ],
  });

  await smartAccount.init();
  const context = smartAccount.getSmartAccountContext();
  const signer = provider.provider.getSigner();
  const balance = await provider.provider.getBalance(await signer.getAddress());

  return {
    smartAccount,
    smartAccountWalletAddress: context.baseWallet.getAddress(),
    smartAccountWalletBalance: await balance.toString(),
  };
});

// TODO: Figure out how to cancel this if the user closes the wallet.
export const loginAtom = atom(null, async (get, set, interactive: boolean) => {
  if (interactive) {
    set(showWalletAtom);
  }

  const currentAuth = await get(trpcJotai.auth.authenticated.atomWithQuery());
  if (currentAuth) {
    return currentAuth;
  }

  const provider = await get(providerAndAccountAtom);
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
  const loginAuth = await set(trpcJotai.auth.login.atomWithMutation(), [
    { message, signature },
  ]);
  return loginAuth;
});

export const logoutAtom = atom(null, async (get, set) => {
  const socialLogin = await get(socialLoginAtom);
  socialLogin.hideWallet();
  try {
    await socialLogin.logout();
  } catch (e) {}
  await set(trpcJotai.auth.logout.atomWithMutation(), []);
  set(ticker, new Date().getTime());
});
