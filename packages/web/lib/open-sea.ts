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
    421614,
    {
      tokenUrl: (tokenId) =>
        `https://testnets.opensea.io/assets/arbitrum-sepolia/0x223A74B8323914afDC3ff1e5005564dC17231d6e/${tokenId}`,
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
  // TODO: Uncomment once OpenSea add Optimism Sepolia support
  // [
  //   11155420,
  //   {
  //     tokenUrl: (tokenId) =>
  //       `https://testnets.opensea.io/assets/optimism-sepolia/0x68A2f4423ad3bf5139Db563CF3bC80aA09ed7079/${tokenId}`,
  //   },
  // ],
  [
    11155420,
    {
      tokenUrl: (tokenId) =>
        `https://testnets.opensea.io/assets/base-sepolia/0xA85aAE9f0Aec5F5638E5F13840797303Ab29c9f9/${tokenId}`,
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
