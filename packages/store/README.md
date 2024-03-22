# `@tableland/studio-store`

[![License: MIT AND Apache-2.0](https://img.shields.io/badge/License-MIT%20AND%20Apache--2.0-blue.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Ftablelandnetwork%2Fstudio%2Fmain%2Fpackages%2Fchains%2Fpackage.json&query=%24.version&label=Version)](./package.json)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg)](https://github.com/RichardLitt/standard-readme)

> Studio specific data store.

## Background

This package contains the schemas of the data used for the operation of Studio. For a quick start on what the Studio data store looks like read through the [schemas](https://github.com/tablelandnetwork/studio/blob/main/packages/store/src/schema/index.ts)

## Install

You can install via npm, but this is a store designed, specifically, for Studio, so it is not recommended to use this package outside of the Studio.

```
npm install @tableland/studio-store
```

## Usage

See the `web` package for the store is used in the context of Studio.

## Development

All of the data in Studio is publicly readable. If you're curious you can directly query the Studio tables using any of the Tableland read query tools. Check out our Validator API quick start to do queries with your browser: [here](https://docs.tableland.xyz/quickstarts/api-quickstart#1-make-a-read-query). The full universally unique table names are listed: [here](https://github.com/tablelandnetwork/studio/blob/main/packages/web/tables_42170.json)

## Contributing

PRs accepted. Studio is still under initial development, so if you are interested in helping out, feel free to connect on Discord:
[https://tableland.xyz/discord](https://tableland.xyz/discord)

Small note: If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT AND Apache-2.0, © 2021-2024 Tableland Network Contributors
