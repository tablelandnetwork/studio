import {
  Chain,
  arbitrum,
  arbitrumGoerli,
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
} from "wagmi/chains";

export function chains() {
  const res: Chain[] = [
    { ...arbitrum, testnet: false },
    { ...arbitrumGoerli, testnet: true },
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
  if (
    window &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    res.push({ ...hardhat, testnet: undefined });
  }
  res.sort((a, b) => (a.name > b.name ? 1 : -1));
  return res;
}
