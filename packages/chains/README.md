## Overview

This package is a single file that stitches wagmi and viem together to configure the studio supported chains with RPC Providers like alchemy and infura.

## Usage

The entire package is contained in [src/index.ts](https://github.com/tablelandnetwork/studio/blob/main/packages/chains/src/index.ts).  You might find it easiest to read through that file.
There are two functions exported:
- `configuredChains`: takes one optional boolean argument indicating if a localhost chain should be included, default is `fasle`.  Returns the chains studio supports with provider urls configured
- `supportedChains`: takes one optional boolean argument indicating if a localhost chain should be included, default is `fasle`.  Returns the chains studio supports

## License

MIT AND Apache-2.0, © 2021-2023 Tableland Network Contributors
