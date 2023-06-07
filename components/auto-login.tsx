import { useSetAtom } from "jotai";
import { useEffect } from "react";

import { loginAtom } from "@/store/login";

export default function AutoLogin() {
  const login = useSetAtom(loginAtom);
  useEffect(() => {
    login(false);
  }, [login]);

  return null;
}
