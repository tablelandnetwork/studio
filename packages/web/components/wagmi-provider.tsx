"use client";

import { chains as supportedChains } from "@/lib/chains";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { infuraProvider } from "wagmi/providers/infura";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  supportedChains(),
  [
    infuraProvider({ apiKey: "92f6902cf1214401ae5b08a1e117eb91" }),
    jsonRpcProvider({
      rpc: () => ({
        http: "https://neat-dark-dust.nova-mainnet.quiknode.pro/2d4bbaa84ce4721fc6576c47051cd505e16fb325/",
      }),
    }),
    publicProvider(),
  ],
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
