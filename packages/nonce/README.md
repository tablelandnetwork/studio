# `@tableland/nonce`

[![License: MIT AND Apache-2.0](https://img.shields.io/badge/License-MIT%20AND%20Apache--2.0-blue.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Ftablelandnetwork%2Fstudio%2Fmain%2Fpackages%2Fchains%2Fpackage.json&query=%24.version&label=Version)](./package.json)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg)](https://github.com/RichardLitt/standard-readme)

> Redis-based EVM wallet nonce manager.

## Background

This package is a nonce manager for Ethereum wallets using a Redis store. A nonce manager is required to ensure the backend wallet nonce is in sync with the onchain transactions. For example—with a Vercel web app, if a set of different users send transactions that are sponsored by the backend wallet, the nonce manager will ensure that the transactions are sent with the correct nonce. Without this, Vercel might send transactions out of order, and the transactions will fail.

## Install

You can install via npm.

```
npm install @tableland/nonce
```

## Usage

The example below is shown with ethers v5.

```
import { Wallet, getDefaultProvider } from "ethers";
import { NonceManager } from "@tableland/nonce";

const privateKey = "59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"; // Your private key
const wallet = new Wallet(privateKey);
const provider = getDefaultProvider("http://127.0.0.1:8545"); // Your RPC URL

// Set up the nonce manager
const signer = new NonceManager(wallet.connect(provider))
```

## Development

See the `web` package for how the nonce manager is used in the context of Studio.

## Contributing

PRs accepted. Studio is still under initial development, so if you are interested in helping out, feel free to connect on Discord:
[https://tableland.xyz/discord](https://tableland.xyz/discord)

Small note: If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT AND Apache-2.0, © 2021-2024 Tableland Network Contributors
