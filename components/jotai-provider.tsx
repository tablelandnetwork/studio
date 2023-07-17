"use client";

import { Provider } from "jotai";

export const JotaiProvider: React.FC<{ children: React.ReactNode }> = (p) => {
  return <Provider>{p.children}</Provider>;
};
