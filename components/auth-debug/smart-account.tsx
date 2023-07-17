"use client";

import { smartAccountAtom } from "@/store/wallet";
import { useAtomValue } from "jotai";

export default function SmartAccount() {
  const smartAccount = useAtomValue(smartAccountAtom);
  return (
    <div>
      <p>Smart account address: {smartAccount?.address}</p>
    </div>
  );
}
