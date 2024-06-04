export const blockExplorers = new Map<
  number,
  {
    explorer: string;
    blockUrl: (block: number) => string;
    txUrl: (hash: string) => string;
  }
>([
  [
    1,
    {
      explorer: "Etherscan",
      blockUrl: (block) => `https://etherscan.io/block/${block}`,
      txUrl: (hash) => `https://etherscan.io/tx/${hash}`,
    },
  ],
  [
    11155111,
    {
      explorer: "Etherscan",
      blockUrl: (block) => `https://sepolia.etherscan.io/block/${block}`,
      txUrl: (hash) => `https://sepolia.etherscan.io/tx/${hash}`,
    },
  ],
  [
    314,
    {
      explorer: "Filfox",
      blockUrl: (block) => `https://filfox.info/en/tipset/${block}`,
      txUrl: (hash) => `https://filfox.info/en/message/${hash}`,
    },
  ],
  [
    314159,
    {
      explorer: "Filfox",
      blockUrl: (block) => `https://calibration.filfox.info/en/tipset/${block}`,
      txUrl: (hash) => `https://calibration.filfox.info/en/message/${hash}`,
    },
  ],
  [
    421613,
    {
      explorer: "Arbiscan",
      blockUrl: (block) => `https://testnet.arbiscan.io/block/${block}`,
      txUrl: (hash) => `https://testnet.arbiscan.io/tx/${hash}`,
    },
  ],
  [
    421614,
    {
      explorer: "Arbiscan",
      blockUrl: (block) => `https://sepolia.arbiscan.io/block/${block}`,
      txUrl: (hash) => `https://sepolia.arbiscan.io/tx/${hash}`,
    },
  ],
  [
    42161,
    {
      explorer: "Arbiscan",
      blockUrl: (block) => `https://arbiscan.io/block/${block}`,
      txUrl: (hash) => `https://arbiscan.io/tx/${hash}`,
    },
  ],
  [
    42170,
    {
      explorer: "Arbiscan",
      blockUrl: (block) => `https://nova.arbiscan.io/block/${block}`,
      txUrl: (hash) => `https://nova.arbiscan.io/tx/${hash}`,
    },
  ],
  [
    10,
    {
      explorer: "Etherscan",
      blockUrl: (block) => `https://optimistic.etherscan.io/block/${block}`,
      txUrl: (hash) => `https://optimistic.etherscan.io/tx/${hash}`,
    },
  ],
  [
    11155420,
    {
      explorer: "Etherscan",
      blockUrl: (block) =>
        `https://sepolia-optimism.etherscan.io/block/${block}`,
      txUrl: (hash) => `https://sepolia-optimism.etherscan.io/tx/${hash}`,
    },
  ],
  [
    84532,
    {
      explorer: "BaseScan",
      blockUrl: (block) => `https://sepolia.basescan.org/block/${block}`,
      txUrl: (hash) => `https://sepolia.basescan.org/tx/${hash}`,
    },
  ],
  [
    137,
    {
      explorer: "PolygonScan",
      blockUrl: (block) => `https://polygonscan.com/block/${block}`,
      txUrl: (hash) => `https://polygonscan.com/tx/${hash}`,
    },
  ],
  [
    80001,
    {
      explorer: "PolygonScan",
      blockUrl: (block) => `https://mumbai.polygonscan.com/block/${block}`,
      txUrl: (hash) => `https://mumbai.polygonscan.com/tx/${hash}`,
    },
  ],
]);
