import { supportedChains } from "@tableland/studio-chains";
import { Chain } from "viem";

export const chainsMap = supportedChains(true).reduce((acc, chain) => {
  acc.set(chain.id, chain);
  return acc;
}, new Map<number, Chain>());
