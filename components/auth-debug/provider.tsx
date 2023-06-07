import { useAtom } from "jotai";

import { providerAndAccountAtom } from "@/store/login";

export default function Provider() {
  const [providerAndAccount] = useAtom(providerAndAccountAtom);
  return (
    <div>
      <p>Account address: {providerAndAccount.account}</p>
    </div>
  );
}
