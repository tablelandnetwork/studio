import { configureChains } from "@wagmi/core";
import { infuraProvider } from "@wagmi/core/providers/infura";
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc";
import { publicProvider } from "@wagmi/core/providers/public";
import {
  type Chain,
  arbitrum,
  arbitrumSepolia,
  arbitrumNova,
  filecoin,
  filecoinCalibration,
  hardhat,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonMumbai,
  sepolia,
} from "viem/chains";

export interface ApiKeys {
  infura?: string;
  quickNode?: string;
}

function supportedChains(isLocalDev = false) {
  const res: Chain[] = [
    { ...arbitrum, testnet: false },
    { ...arbitrumSepolia, testnet: true },
    { ...arbitrumNova, testnet: false },
    { ...filecoin, testnet: false },
    { ...filecoinCalibration, testnet: true },
    { ...mainnet, testnet: false },
    { ...optimism, name: "Optimism", testnet: false },
    { ...optimismSepolia, testnet: true },
    { ...polygon, testnet: false },
    { ...polygonMumbai, testnet: true },
    { ...sepolia, testnet: true },
  ];
  if (isLocalDev) {
    res.push({ ...hardhat, testnet: undefined });
  }
  res.sort((a, b) => (a.name > b.name ? 1 : -1));
  return res;
}

function configuredChains(isLocalDev = false, apiKeys?: ApiKeys) {
  const infuraKey = apiKeys?.infura ?? "";
  const quickNodeKey = apiKeys?.quickNode ?? "";

  return configureChains(supportedChains(isLocalDev), [
    infuraProvider({ apiKey: infuraKey }),
    jsonRpcProvider({
      rpc: (chain) => {
        let slug = "breakit";
        if (chain.id === arbitrumNova.id) {
          slug = "nova-mainnet";
        }
        return {
          http: `https://neat-dark-dust.${slug}.quiknode.pro/${quickNodeKey}/`,
        };
      },
    }),
    publicProvider(),
  ]);
}

export { configuredChains, supportedChains };
