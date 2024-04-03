# Tableland Studio

[![Review](https://github.com/tablelandnetwork/studio/actions/workflows/review.yml/badge.svg)](https://github.com/tablelandnetwork/studio/actions/workflows/review.yml)
[![Test](https://github.com/tablelandnetwork/studio/actions/workflows/test.yml/badge.svg)](https://github.com/tablelandnetwork/studio/actions/workflows/test.yml)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg)](https://github.com/RichardLitt/standard-readme)

> Build projects on Tableland with the Studio web app and accompanying CLI tool.

## Background

The Tableland Studio is designed to make it easier to manage, deploy, and inspect Tableland projects. It includes a web app for managing your projects, a CLI tool for interacting with the Studio API, and a series of other packages used by these tools.

The full documentation is [available on our docs site](https://docs.tableland.xyz/studio/).

## Usage

The `packages` directory contains the different packages used by Studio. All of them are also published on npm, except for the `web` package.

### Repo layout

- `api`: the Studio backend API, built with tRPC. Package name: [`@tableland/studio-api`](https://www.npmjs.com/package/@tableland/studio-api)
- `chains`: static info on Tableland supported chains, and helpers to get node providers. Package name: [`@tableland/studio-chains`](https://www.npmjs.com/package/@tableland/studio-chains)
- `cli`: command line Studio client built with Node.js. Package name: [`@tableland/studio-cli`](https://www.npmjs.com/package/@tableland/studio-cli)
- `client`: HTTP client for the Studio API. Package name: [`@tableland/studio-client`](https://www.npmjs.com/package/@tableland/studio-client)
- `mail`: email sending interfaces. Package name: [`@tableland/studio-mail`](https://www.npmjs.com/package/@tableland/studio-mail)
- `nonce`: Redis-based nonce manager. Package name: [`@tableland/nonce`](https://www.npmjs.com/package/@tableland/nonce)
- `store`: an internal Studio data store. Package name: [`@tableland/studio-store`](https://www.npmjs.com/package/@tableland/studio-store)
- `validators`: shared Zod schemas for Studio. Package name: [`@tableland/studio-validators`](https://www.npmjs.com/package/@tableland/studio-validators)
- `web`: a web-based Studio client built with Next.js.

## Development

Review each of the READMEs in the `packages` directory for more information on how to set up a development environment.

## Contributing

PRs accepted. Studio is still under initial development, so if you are interested in helping out, feel free to connect on Discord:
[https://tableland.xyz/discord](https://tableland.xyz/discord)

Small note: If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT AND Apache-2.0, © 2021-2024 Tableland Network Contributors
