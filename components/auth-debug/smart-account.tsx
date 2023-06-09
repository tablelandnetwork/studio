"use client";

import { useAtom } from "jotai";

import { smartAccountAtom } from "@/store/login";

export default function SmartAccount() {
  const [smartAccount] = useAtom(smartAccountAtom);
  return (
    <div>
      <p>Smart account address: {smartAccount.smartAccountWalletAddress}</p>
    </div>
  );
}
