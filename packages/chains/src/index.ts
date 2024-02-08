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
    // TODO: this key should not be committed to github, make it an ENV var
    infuraProvider({ apiKey: "92f6902cf1214401ae5b08a1e117eb91" }),
    jsonRpcProvider({
      rpc: (chain) => {
        let slug = "breakit";
        if (chain.id === arbitrumNova.id) {
          slug = "nova-mainnet";
        }
        return {
          // TODO: this key should not be committed to github, make it an ENV var
          http: `https://neat-dark-dust.${slug}.quiknode.pro/2d4bbaa84ce4721fc6576c47051cd505e16fb325/`,
        };
      },
    }),
    publicProvider(),
  ]);
}

export { configuredChains, supportedChains };
