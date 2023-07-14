import SocialLogin from "@biconomy/web3-auth";
import { ethers } from "ethers";
import { atom } from "jotai";

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
