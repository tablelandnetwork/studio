"use client";

import { autoConnectAtom, pollProviderAtom } from "@/store/social-login";
import { useSetAtom } from "jotai";
import { useEffect } from "react";

export default function AutoLogin() {
  const pollMetamask = useSetAtom(pollProviderAtom);
  const autoConnect = useSetAtom(autoConnectAtom);

  useEffect(() => {
    pollMetamask();
    autoConnect();
  }, [autoConnect, pollMetamask]);

  return null;
}
