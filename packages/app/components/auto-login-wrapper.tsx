"use client";

import dynamic from "next/dynamic";

const AutoLogin = dynamic(
  () => import("@/components/auto-login").then((res) => res.default),
  { ssr: false },
);

export default function AutoLoginWrapper() {
  return <AutoLogin />;
}
