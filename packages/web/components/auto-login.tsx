"use client";

import { autoConnectAtom } from "@/store/social-login";
import { useSetAtom } from "jotai";
import { useEffect } from "react";

export default function AutoLogin() {
  const autoConnect = useSetAtom(autoConnectAtom);

  useEffect(() => {
    autoConnect();
  }, [autoConnect]);

  return null;
}
