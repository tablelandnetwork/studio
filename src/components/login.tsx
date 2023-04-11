import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { SiweMessage } from "siwe";
import { Web3Provider } from "@ethersproject/providers";
import { ChainId } from "@biconomy-sdk-dev/core-types";
import SocialLogin from "@biconomy-sdk-dev/web3-auth";
import SmartAccount from "@biconomy-sdk-dev/smart-account";
import "@biconomy-sdk-dev/web3-auth/dist/src/style.css";
import Button from "./button";
import toChecksumAddress from "@/lib/to-checksum-addr";

async function createSiweMessage(
  address: string,
  statement: string,
  chainId: number
) {
  const res = await fetch(`/api/nonce`, {
    credentials: "include",
  });
  const message = new SiweMessage({
    domain: window.location.host,
    address,
    statement,
    uri: origin,
    version: "1",
    chainId,
    nonce: (await res.json()).result,
  });
  return message.prepareMessage();
}

async function signInWithEthereum(signer: ethers.Signer) {
  const res0 = await fetch("/api/me");
  if (res0.status === 200) {
    return;
  }
  const message = await createSiweMessage(
    toChecksumAddress(await signer.getAddress()),
    "Sign in to Studio with your wallet address. This only requires a signature, no transaction will be sent.",
    await signer.getChainId()
  );
  const signature = await signer.signMessage(message);

  await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, signature }),
    credentials: "include",
  });
}

export default function Login() {
  const [loadingSdk, setLoadingSdk] = useState(true);
  const [provider, setProvider] = useState<Web3Provider>();
  const [account, setAccount] = useState<string>();
  const [smartAccount, setSmartAccount] = useState<SmartAccount>();
  const [scwAddress, setScwAddress] = useState("");
  const [scwLoading, setScwLoading] = useState(false);
  const [socialLoginSDK, setSocialLoginSDK] = useState<SocialLogin>();

  useEffect(() => {
    async function initSdk() {
      setLoadingSdk(true);
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
      await sdk.init({ whitelistUrls });
      setSocialLoginSDK(sdk);
      setLoadingSdk(false);
    }
    initSdk();
  }, []);

  const resolveProviderAndAccount = useCallback(async () => {
    if (socialLoginSDK?.provider) {
      const web3Provider = new Web3Provider(socialLoginSDK.provider);
      setProvider(web3Provider);
      const accounts = await web3Provider.listAccounts();
      setAccount(accounts[0]);
    }
  }, [socialLoginSDK]);

  const showWallet = useCallback(() => {
    if (socialLoginSDK) {
      socialLoginSDK.showWallet();
    }
  }, [socialLoginSDK]);

  useEffect(() => {
    resolveProviderAndAccount();
  }, [resolveProviderAndAccount]);

  // if wallet already connected close widget
  useEffect(() => {
    if (socialLoginSDK && socialLoginSDK.provider) {
      socialLoginSDK.hideWallet();
    }
  }, [account, socialLoginSDK]);

  // after metamask login -> get provider event
  useEffect(() => {
    const interval = setInterval(async () => {
      if (account) {
        clearInterval(interval);
      }
      if (socialLoginSDK?.provider && !account) {
        resolveProviderAndAccount();
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [account, resolveProviderAndAccount, socialLoginSDK]);

  const disconnectWeb3 = async () => {
    if (!socialLoginSDK || !socialLoginSDK.web3auth) {
      console.error("Web3Modal not initialized.");
      return;
    }
    await socialLoginSDK.logout();
    socialLoginSDK.hideWallet();
    setProvider(undefined);
    setAccount(undefined);
    setScwAddress("");
    await fetch("api/logout");
  };

  useEffect(() => {
    async function setupSmartAccount() {
      if (!provider) {
        return;
      }
      setScwAddress("");
      setScwLoading(true);
      const smartAccount = new SmartAccount(provider, {
        activeNetworkId: ChainId.GOERLI,
        supportedNetworksIds: [ChainId.GOERLI],
      });
      await smartAccount.init();
      const context = smartAccount.getSmartAccountContext();
      setScwAddress(context.baseWallet.getAddress());
      setSmartAccount(smartAccount);
      await signInWithEthereum(smartAccount.signer);
      setScwLoading(false);
    }
    if (!!provider && !!account) {
      setupSmartAccount();
    }
  }, [account, provider]);

  useEffect(() => {
    async function getInfo() {
      const info = await socialLoginSDK?.getUserInfo();
      console.log(info);
    }
    if (!!provider && !!account) {
      getInfo();
    }
  }, [provider, account, socialLoginSDK]);

  let dispAddr = "";
  if (!!scwAddress) {
    dispAddr = scwAddress.slice(0, 6) + "..." + scwAddress.slice(-6);
  }

  return (
    <div className="flex items-center space gap-4">
      {scwLoading && <p>Loading Smart Account...</p>}
      {!scwLoading && !!scwAddress && <p>{dispAddr}</p>}
      <Button
        onClick={!account ? showWallet : disconnectWeb3}
        intent={account ? "secondary" : "primary"}
        disabled={loadingSdk || scwLoading}
      >
        {!account || scwLoading ? "Sign In" : "Sign Out"}
      </Button>
    </div>
  );
}
