import { providerAndAccountAtom } from "@/store/login";
import { useAtom } from "jotai";

export default function Provider() {
  const [providerAndAccount] = useAtom(providerAndAccountAtom);
  return (
    <div>
      <p>Account address: {providerAndAccount.account}</p>
    </div>
  );
}
