# `@tableland/studio-chains`

[![License: MIT AND Apache-2.0](https://img.shields.io/badge/License-MIT%20AND%20Apache--2.0-blue.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Ftablelandnetwork%2Fstudio%2Fmain%2Fpackages%2Fchains%2Fpackage.json&query=%24.version&label=Version)](./package.json)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg)](https://github.com/RichardLitt/standard-readme)

> Info on Tableland supported chains and helpers to get node providers.

## Background

This package is a single file that stitches wagmi and viem together to configure the Studio supported chains with RPC Providers like Alchemy and Infura.

## Install

You can install via npm.

```
npm install @tableland/chains
```

## Usage

The entire package is contained in [src/index.ts](https://github.com/tablelandnetwork/studio/blob/main/packages/chains/src/index.ts). You might find it easiest to read through that file.
There are two functions exported:

- `configuredChains`: takes one optional boolean argument indicating if a localhost chain should be included, default is `false`. Returns the chains studio supports with provider urls configured
- `supportedChains`: takes one optional boolean argument indicating if a localhost chain should be included, default is `false`. Returns the chains studio supports

## Development

See the `web` package for how the chains are used in the context of Studio.

## Contributing

PRs accepted. Studio is still under initial development, so if you are interested in helping out, feel free to connect on Discord:
[https://tableland.xyz/discord](https://tableland.xyz/discord)

Small note: If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT AND Apache-2.0, © 2021-2024 Tableland Network Contributors
