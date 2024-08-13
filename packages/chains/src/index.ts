import { configureChains } from "@wagmi/core";
import { alchemyProvider } from "@wagmi/core/providers/alchemy";
import { publicProvider } from "@wagmi/core/providers/public";
import { defineChain } from "viem";
import {
  type Chain,
  arbitrum,
  arbitrumSepolia,
  arbitrumNova,
  base,
  baseSepolia,
  filecoin,
  filecoinCalibration,
  hardhat,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  sepolia,
} from "viem/chains";

export interface ApiKeys {
  alchemy?: string;
}

// Note: copied from viem@2.9.22
const polygonAmoy = defineChain({
  id: 80_002,
  name: "Polygon Amoy",
  network: "polygon-amoy",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-amoy.polygon.technology"],
    },
    public: {
      http: ["https://rpc-amoy.polygon.technology"],
    },
  },
  blockExplorers: {
    default: {
      name: "Polygonscan",
      url: "https://amoy.polygonscan.com",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 3127388,
    },
  },
  testnet: true,
});

function supportedChains(isLocalDev = false) {
  const res: Chain[] = [
    { ...arbitrum, testnet: false },
    { ...arbitrumSepolia, testnet: true },
    { ...arbitrumNova, testnet: false },
    { ...base, testnet: false },
    { ...baseSepolia, testnet: true },
    { ...filecoin, testnet: false },
    { ...filecoinCalibration, testnet: true },
    { ...mainnet, testnet: false },
    { ...optimism, name: "Optimism", testnet: false },
    { ...optimismSepolia, testnet: true },
    { ...polygon, testnet: false },
    { ...polygonAmoy, testnet: true },
    { ...sepolia, testnet: true },
  ];
  if (isLocalDev) {
    res.push({ ...hardhat, testnet: undefined });
  }
  res.sort((a, b) => (a.name > b.name ? 1 : -1));
  return res;
}

function configuredChains(isLocalDev = false, apiKeys?: ApiKeys) {
  const alchemyKey = apiKeys?.alchemy ?? "";

  return configureChains(supportedChains(isLocalDev), [
    alchemyProvider({ apiKey: alchemyKey }),
    publicProvider(),
  ]);
}

export { configuredChains, supportedChains };
