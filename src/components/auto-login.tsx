import { loginAtom } from "@/store/login";
import { useSetAtom } from "jotai";
import { useEffect } from "react";

export default function AutoLogin() {
  const login = useSetAtom(loginAtom);
  useEffect(() => {
    login(false);
  }, [login]);

  return null;
}
