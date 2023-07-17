"use client";

import { useAtomValue } from "jotai";

import { accountAtom } from "@/store/wallet";

export default function Provider() {
  const account = useAtomValue(accountAtom);
  return (
    <div>
      <p>Account address: {account}</p>
    </div>
  );
}
