"use client";

import "@biconomy/web3-auth/dist/src/style.css";

import { authenticated, login, nonce, register } from "@/app/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Team } from "@/db/schema";
import toChecksumAddress from "@/lib/toChecksumAddr";
import {
  accountAtom,
  providerAtom,
  scwAddressAtom,
  scwLoadingAtom,
  smartAccountAtom,
  socialLoginSDKAtom,
} from "@/store/wallet";
import { ChainId } from "@biconomy/core-types";
import SmartAccount from "@biconomy/smart-account";
import SocialLogin from "@biconomy/web3-auth";
import { ethers } from "ethers";
import { useAtom, useSetAtom } from "jotai";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { SiweMessage } from "siwe";
import { MenuUser } from "./menu-user";
import { MenuWallet } from "./menu-wallet";
import { Button } from "./ui/button";

export default function UserActions({ personalTeam }: { personalTeam?: Team }) {
  const [socialLoginSDK, setSocialLoginSDK] = useAtom(socialLoginSDKAtom);
  const [account, setAccount] = useAtom(accountAtom);
  const [provider, setProvider] = useAtom(providerAtom);
  const setScwAddress = useSetAtom(scwAddressAtom);
  const setScwLoading = useSetAtom(scwLoadingAtom);
  const setSmartAccount = useSetAtom(smartAccountAtom);

  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRegister = () => {
    if (!username.length) return;
    startTransition(async () => {
      const res = await register(username, email);
      if (res.auth) {
        setShowRegisterDialog(false);
        setUsername("");
        setEmail("");
        router.push(`/${res.auth.personalTeam.slug}`);
      } else if (res.error) {
        setRegisterError(res.error);
      }
    });
  };

  const handleCancel = () => {
    setShowRegisterDialog(false);
    setUsername("");
    setEmail("");
  };

  const connectWeb3 = useCallback(
    async (showWallet: boolean) => {
      if (typeof window === "undefined") return;
      if (socialLoginSDK?.provider) {
        const web3Provider = new ethers.providers.Web3Provider(
          socialLoginSDK.provider
        );
        setProvider(web3Provider);
        const accounts = await web3Provider.listAccounts();
        setAccount(accounts[0]);
        return;
      }
      if (socialLoginSDK && showWallet) {
        socialLoginSDK.showWallet();
        return;
      }
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
      setSocialLoginSDK(sdk);
      if (showWallet) {
        sdk.showWallet();
      }
    },
    [setAccount, setProvider, setSocialLoginSDK, socialLoginSDK]
  );

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
        connectWeb3(true);
      }
    }, 500);
    return () => {
      clearInterval(interval);
    };
  }, [account, connectWeb3, socialLoginSDK]);

  // useEffect(() => {
  //   connectWeb3(false);
  // }, [connectWeb3]);

  useEffect(() => {
    async function setupSmartAccount() {
      setScwAddress("");
      setScwLoading(true);
      const smartAccount = new SmartAccount(provider!, {
        activeNetworkId: ChainId.GOERLI,
        supportedNetworksIds: [ChainId.GOERLI],
      });
      await smartAccount.init();
      const context = smartAccount.getSmartAccountContext();
      setScwAddress(context.baseWallet.getAddress());
      setSmartAccount(smartAccount);
      setScwLoading(false);
    }
    if (!!provider && !!account) {
      setupSmartAccount();
    }
  }, [account, provider, setScwAddress, setScwLoading, setSmartAccount]);

  useEffect(() => {
    (async () => {
      if (!provider) return;
      const currentAuth = await authenticated();
      if (currentAuth) {
        return currentAuth;
      }
      const signer = provider.getSigner();
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
      startTransition(async () => {
        const res = await login(message, signature);
        if (res.error) {
          // TODO: Handle error.
        } else if (!res.auth) {
          setShowRegisterDialog(true);
        } else {
          router.push(`/${res.auth.personalTeam.slug}`);
        }
      });
    })();
  }, [provider, router]);

  return (
    <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
      {!account && !personalTeam && (
        <Button onClick={() => connectWeb3(true)}>Connect Wallet</Button>
      )}
      {account && !personalTeam && <MenuWallet />}
      {account && personalTeam && <MenuUser personalTeam={personalTeam} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Studio Registration</DialogTitle>
          <DialogDescription>
            To use Studio, you&apos;ll need to choose a username. Email
            isn&apos;t required, but if you do share it with us, we&apos;ll only
            use it to send you important updates about Studio.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Username</Label>
              <Input
                id="name"
                placeholder="myusername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Email address</Label>
              <Input
                id="name"
                placeholder="me@me.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          {!!registerError && <p>Error registering: {registerError}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleRegister} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
