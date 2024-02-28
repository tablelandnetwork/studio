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
  optimismGoerli,
  polygon,
  polygonMumbai,
  sepolia,
} from "viem/chains";

const INFURA_KEY = process.env.INFURA_KEY ?? "";
const QUICK_NODE_KEY = process.env.QUICK_NODE_KEY ?? "";

function supportedChains(isLocalDev = false) {
  const res: Chain[] = [
    { ...arbitrum, testnet: false },
    { ...arbitrumSepolia, testnet: true },
    { ...arbitrumNova, testnet: false },
    { ...filecoin, testnet: false },
    { ...filecoinCalibration, testnet: true },
    { ...mainnet, testnet: false },
    { ...optimism, name: "Optimism", testnet: false },
    { ...optimismGoerli, testnet: true },
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

function configuredChains(isLocalDev = false) {
  return configureChains(supportedChains(isLocalDev), [
    infuraProvider({ apiKey: INFURA_KEY }),
    jsonRpcProvider({
      rpc: (chain) => {
        let slug = "breakit";
        if (chain.id === arbitrumNova.id) {
          slug = "nova-mainnet";
        }
        return {
          http: `https://neat-dark-dust.${slug}.quiknode.pro/${QUICK_NODE_KEY}/`,
        };
      },
    }),
    publicProvider(),
  ]);
}

export { configuredChains, supportedChains };
