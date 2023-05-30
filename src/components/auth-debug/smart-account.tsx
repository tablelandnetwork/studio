import { useAtom } from "jotai";

import { smartAccountAtom } from "@/store/login";

export default function SmartAccount() {
  const [smartAccount] = useAtom(smartAccountAtom);

  console.log("B:", smartAccount.smartAccountWalletBalance);
  return (
    <div>
      <p>Smart account address: {smartAccount.smartAccountWalletAddress}</p>
      <p>
        Smart account balance:{" "}
        {smartAccount.smartAccountWalletBalance.toString()}
      </p>
    </div>
  );
}
