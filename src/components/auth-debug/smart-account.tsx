import { smartAccountAtom } from "@/store/login";
import { useAtom } from "jotai";

export default function SmartAccount() {
  const [smartAccount] = useAtom(smartAccountAtom);
  return (
    <div>
      <p>Smart account address: {smartAccount.smartAccountWalletAddress}</p>
    </div>
  );
}
