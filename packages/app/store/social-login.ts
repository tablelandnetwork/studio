import { authenticated, login, logout, nonce, register } from "@/app/actions";
import toChecksumAddress from "@/lib/toChecksumAddr";
import { ChainId } from "@biconomy/core-types";
import SmartAccount from "@biconomy/smart-account";
import SocialLogin from "@biconomy/web3-auth";
import { Auth } from "@tableland/studio-api";
import { ethers } from "ethers";
import { atom } from "jotai";
import { SiweMessage } from "siwe";
import {
  accountAtom,
  authAtom,
  loggingInAtom,
  providerAtom,
  scwAddressAtom,
  scwLoadingAtom,
  smartAccountAtom,
} from "./wallet";

export const socialLoginSDKAtom = atom(async () => {
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

const loggedOutAtAtom = atom(new Date());

const blockUntilProvider = atom(async (get) => {
  get(loggedOutAtAtom);
  const socialLoginSDK = await get(socialLoginSDKAtom);
  while (!socialLoginSDK.provider) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return socialLoginSDK.provider;
});

export const connectWeb3Atom = atom(
  undefined,
  async (
    get,
    set,
    showWallet: boolean,
  ): Promise<{ auth?: Auth; error?: string }> => {
    set(loggingInAtom, true);
    const socialLoginSDK = await get(socialLoginSDKAtom);
    // TODO: Sometimes we have a session with the server, but the login sdk has no provider. We should log out with the server.
    // if (!socialLoginSDK.provider) {
    //   await set(logoutAtom);
    // }
    if (!socialLoginSDK.provider && showWallet) {
      socialLoginSDK.showWallet();
    } else if (!socialLoginSDK.provider && !showWallet) {
      set(loggingInAtom, false);
      return { error: "No provider, but you don't want to show the wallet." };
    }
    const provider = await get(blockUntilProvider);
    // Moved this here because it seems like we don't need a separate effect for it.
    socialLoginSDK.hideWallet();
    const web3Provider = new ethers.providers.Web3Provider(provider);
    set(providerAtom, web3Provider);
    const accounts = await web3Provider.listAccounts();
    set(accountAtom, accounts[0]);

    // Kick off smart account setup.
    set(setupSmartAccount, web3Provider);

    // Sign in with server
    const currentAuth = await authenticated();
    if (
      currentAuth &&
      currentAuth.user.address.toLowerCase() === accounts[0].toLowerCase()
    ) {
      // TODO: Something here to make sure the session/auth originates from this wallet. Compare address? Done.
      set(authAtom, currentAuth);
      set(loggingInAtom, false);
      return { auth: currentAuth };
    }
    const signer = web3Provider.getSigner();
    const rawMessage = new SiweMessage({
      domain: window.location.host,
      address: toChecksumAddress(await signer.getAddress()),
      statement:
        "Sign in to Studio with your wallet address. This only requires a signature, no transaction will be sent.",
      uri: origin,
      version: "1",
      chainId: await signer.getChainId(),
      nonce: await nonce(),
    });
    const message = rawMessage.prepareMessage();
    const signature = await signer.signMessage(message);
    const res = await login(message, signature);
    if (res.error) {
      set(loggingInAtom, false);
      return { error: res.error };
    }
    set(authAtom, res.auth ? res.auth : null);
    set(loggingInAtom, false);
    return { auth: res.auth };
  },
);

export const registerAtom = atom(
  undefined,
  async (get, set, username: string, email?: string) => {
    const res = await register(username, email);
    set(authAtom, res.auth ? res.auth : null);
    return res;
  },
);

export const logoutAtom = atom(undefined, async (get, set) => {
  const socialLoginSDK = await get(socialLoginSDKAtom);
  await logout();
  if (socialLoginSDK.web3auth) {
    await socialLoginSDK.logout();
    socialLoginSDK.hideWallet();
  }
  set(providerAtom, null);
  set(accountAtom, null);
  set(smartAccountAtom, null);
  set(scwAddressAtom, null);
  set(authAtom, null);
  set(loggedOutAtAtom, new Date());
});

// Moved to connectWeb3Atom.
// const closeLogin = atom(async (get) => {
//   get(accountAtom);
//   const socialLoginSDK = await get(socialLoginSDKAtom);
//   if (socialLoginSDK.provider) {
//     socialLoginSDK.hideWallet();
//   }
// });

// export const pollProviderAtom = atom(undefined, (get, set) => {
//   const interval = setInterval(async () => {
//     console.log("polling");
//     const account = get(accountAtom);
//     const socialLoginSDK = await get(socialLoginSDKAtom);
//     if (account) {
//       clearInterval(interval);
//     }
//     if (socialLoginSDK.provider && !account) {
//       const res = await set(connectWeb3Atom, false);
//       console.log("polling res", res);
//     }
//   }, 500);
//   return interval;
// });
// pollProviderAtom.onMount = (setAtom) => {
//   console.log("polling on mount");
//   const interval = setAtom();
//   return () => {
//     clearInterval(interval);
//   };
// };

export const autoConnectAtom = atom(undefined, async (get, set) => {
  set(connectWeb3Atom, false);
});
// autoConnectAtom.onMount = (setAtom) => {
//   console.log("auto connect on mount");
//   setAtom();
// };

const setupSmartAccount = atom(
  undefined,
  async (get, set, provider: ethers.providers.Web3Provider) => {
    set(scwAddressAtom, "");
    set(scwLoadingAtom, true);

    const smartAccount = new SmartAccount(provider, {
      activeNetworkId: ChainId.GOERLI,
      supportedNetworksIds: [ChainId.GOERLI],
    });
    await smartAccount.init();
    const context = smartAccount.getSmartAccountContext();
    set(scwAddressAtom, context.baseWallet.getAddress());
    set(smartAccountAtom, smartAccount);
    set(scwLoadingAtom, false);
  },
);
