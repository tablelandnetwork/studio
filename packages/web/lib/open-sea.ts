export const openSeaLinks = new Map<
  number,
  {
    tokenUrl: (tokenId: string) => string;
  }
>([
  [
    1,
    {
      tokenUrl: (tokenId) =>
        `https://opensea.io/assets/ethereum/0x012969f7e3439a9b04025b5a049eb9bad82a8c12/${tokenId}`,
    },
  ],
  [
    421613,
    {
      tokenUrl: (tokenId) =>
        `https://testnets.opensea.io/assets/arbitrum-goerli/0x033f69e8d119205089ab15d340f5b797732f646b/${tokenId}`,
    },
  ],
  [
    42161,
    {
      tokenUrl: (tokenId) =>
        `https://opensea.io/assets/arbitrum/0x9abd75e8640871a5a20d3b4ee6330a04c962affd/${tokenId}`,
    },
  ],
  [
    42170,
    {
      tokenUrl: (tokenId) =>
        `https://opensea.io/assets/arbitrum-nova/0x1a22854c5b1642760a827f20137a67930ae108d2/${tokenId}`,
    },
  ],
  [
    10,
    {
      tokenUrl: (tokenId) =>
        `https://opensea.io/assets/optimism/0xfad44bf5b843de943a09d4f3e84949a11d3aa3e6/${tokenId}`,
    },
  ],
  [
    420,
    {
      tokenUrl: (tokenId) =>
        `https://testnets.opensea.io/assets/optimism-goerli/0xc72e8a7be04f2469f8c2db3f1bdf69a7d516abba/${tokenId}`,
    },
  ],
  [
    137,
    {
      tokenUrl: (tokenId) =>
        `https://opensea.io/assets/matic/0x5c4e6a9e5c1e1bf445a062006faf19ea6c49afea/${tokenId}`,
    },
  ],
  [
    80001,
    {
      tokenUrl: (tokenId) =>
        `https://testnets.opensea.io/assets/mumbai/0x4b48841d4b32c4650e4abc117a03fe8b51f38f68/${tokenId}`,
    },
  ],
]);
