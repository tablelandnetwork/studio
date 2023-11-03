"use client";

import { configuredChains } from "@tableland/studio-chains";
import { InjectedConnector } from "@wagmi/core/connectors/injected";
import { WagmiConfig, createConfig } from "wagmi";

const { chains, publicClient, webSocketPublicClient } = configuredChains(
  typeof window !== "undefined" &&
    (window.location?.hostname === "localhost" ||
      window.location?.hostname === "127.0.0.1"),
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
});

export default function WagmiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
}
