import { authenticated, login, logout, nonce, register } from "@/app/actions";
import { Auth } from "@/lib/session";
import toChecksumAddress from "@/lib/toChecksumAddr";
import { ParticleNetwork, WalletEntryPosition } from "@particle-network/auth";
import { Ethereum } from "@particle-network/chains";
import { ParticleProvider } from "@particle-network/provider";
import { ethers } from "ethers";
import { atom } from "jotai";
import { SiweMessage } from "siwe";
import {
  accountAtom,
  authAtom,
  loggingInAtom,
  providerAtom,
  scwAddressAtom,
} from "./wallet";

export const socialLoginSDKAtom = atom(async () => {
  const particle = new ParticleNetwork({
    projectId: "67bbb709-404e-405a-90e6-cbf09e9fdae5",
    clientKey: "cL8wMwL549UHxglbwvhBvuHZkoWOKilMXXR8ho8P",
    appId: "e6297699-f6f6-4620-8c10-38e3ed326fa5",
    chainName: Ethereum.name, //optional: current chain name, default Ethereum.
    chainId: Ethereum.id, //optional: current chain id, default 1.
    wallet: {
      //optional: by default, the wallet entry is displayed in the bottom right corner of the webpage.
      displayWalletEntry: true, //show wallet entry when connect particle.
      defaultWalletEntryPosition: WalletEntryPosition.BR, //wallet entry position
      uiMode: "dark", //optional: light or dark, if not set, the default is the same as web auth.
      supportChains: [
        { id: 1, name: "Ethereum" },
        { id: 5, name: "Ethereum" },
      ], // optional: web wallet support chains.
      customStyle: {}, //optional: custom wallet style
    },
    securityAccount: {
      //optional: particle security account config
      //prompt set payment password. 0: None, 1: Once(default), 2: Always
      promptSettingWhenSign: 1,
      //prompt set master password. 0: None(default), 1: Once, 2: Always
      promptMasterPasswordSettingWhenLogin: 1,
    },
  });
  return particle;
});

const loggedOutAtAtom = atom(new Date());

// const blockUntilProvider = atom(async (get) => {
//   get(loggedOutAtAtom);
//   const socialLoginSDK = await get(socialLoginSDKAtom);
//   while (!socialLoginSDK.provider) {
//     await new Promise((resolve) => setTimeout(resolve, 500));
//   }
//   return socialLoginSDK.provider;
// });

export const connectWeb3Atom = atom(
  undefined,
  async (
    get,
    set,
    showWallet: boolean
  ): Promise<{ auth?: Auth; error?: string }> => {
    set(loggingInAtom, true);
    const socialLoginSDK = await get(socialLoginSDKAtom);
    // TODO: Sometimes we have a session with the server, but the login sdk has no provider. We should log out with the server.
    // if (!socialLoginSDK.provider) {
    //   await set(logoutAtom);
    // }
    if (showWallet || socialLoginSDK.auth.isLogin()) {
      const userInfo = await socialLoginSDK.auth.login();
    } else {
      set(loggingInAtom, false);
      return { error: "You must show the wallet." };
    }

    // const provider = await get(blockUntilProvider);
    const provider = new ParticleProvider(socialLoginSDK.auth);
    const web3Provider = new ethers.providers.Web3Provider(provider, "any");
    set(providerAtom, web3Provider);
    const accounts = await web3Provider.listAccounts();
    set(accountAtom, accounts[0]);

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
  }
);

export const registerAtom = atom(
  undefined,
  async (get, set, username: string, email?: string) => {
    const res = await register(username, email);
    set(authAtom, res.auth ? res.auth : null);
    return res;
  }
);

export const logoutAtom = atom(undefined, async (get, set) => {
  const socialLoginSDK = await get(socialLoginSDKAtom);
  await logout();
  await socialLoginSDK.auth.logout();
  set(providerAtom, null);
  set(accountAtom, null);
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
