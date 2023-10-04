import { helpers } from "@tableland/sdk";

export function chains() {
  const { getChainInfo } = helpers;
  const res = [
    getChainInfo("arbitrum"),
    getChainInfo("arbitrum-nova"),
    getChainInfo("arbitrum-goerli"),
    getChainInfo("matic"),
    getChainInfo("maticmum"),
    getChainInfo("optimism"),
    getChainInfo("optimism-goerli"),
    getChainInfo("mainnet"),
    getChainInfo("sepolia"),
    getChainInfo("filecoin"),
    getChainInfo("filecoin-calibration"),
  ];
  if (
    window &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    res.push(getChainInfo("localhost"));
  }
  return res;
}
