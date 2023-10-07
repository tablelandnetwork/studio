# @tableland/studio-cli

[![Review](https://github.com/tablelandnetwork/studio/workflows/review.yml/badge.svg)](https://github.com/tablelandnetwork/studio/actions/workflows/review.yml)
[![License](https://img.shields.io/github/license/tablelandnetwork/studio.svg)](./LICENSE)
[![Version](https://img.shields.io/github/package-json/v/tablelandnetwork/studio.svg)](./package.json)
[![Release](https://img.shields.io/github/release/tablelandnetwork/studio.svg)](https://github.com/tablelandnetwork/studio/releases/latest)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg)](https://github.com/RichardLitt/standard-readme)

> Tableland command line tool

# Table of Contents

- [@tableland/studio-cli](#tablelandcli)
- [Table of Contents](#table-of-contents)
- [Background](#background)
- [Usage](#usage)
- [Install](#install)
- [Config](#config)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

# Background

An experimental Tableland Studio command line tool.

# Usage

```bash
Commands:
  cli.js login                              create a login session via private
                                            key
  cli.js logout                             logout current session
  cli.js team <sub>                         manage studio teams
  cli.js project <sub>                      manage studio teams
  cli.js import-data <table> <file>         write the content of a csv into an
                                            existing table
  cli.js import-table <table> <project> <d  import an existing tableland table i
  escription> [name]                        nto a project with description and
                                            optionally with a new name
  cli.js unuse [context]                    remove any existing id from the
                                            given context
  cli.js use [context] [id]                 use the given context id for all
                                            ensuing commands

Options:
  -h, --help              Show help                                    [boolean]
  -V, --version           Show version number                          [boolean]
  -a, --apiUrl            RPC URL for the Studio API
                              [string] [default: "https://studio.tableland.xyz"]
      --baseUrl           The URL of your Tableland validator
                                                          [string] [default: ""]
  -c, --chain             The EVM chain to target         [string] [default: ""]
  -k, --privateKey        Private key string              [string] [default: ""]
  -p, --providerUrl       JSON RPC API provider URL. (e.g., https://eth-rinkeby.
                          alchemyapi.io/v2/123abc123a...) [string] [default: ""]
      --projectId, --pid  Project ID the command is scoped to
                                                          [string] [default: ""]
      --store             path to file store to use for login session
                                    [string] [default: ".studioclisession.json"]
```

# Install

You can install via npm.

```
npm install -g @tableland/studio-cli
```

# Contributing

Studio is still under initial development, if you are interested in helping out feel free to connect on discord
https://discord.gg/kjgrnPhs

# License

MIT AND Apache-2.0, © 2021-2022 Tableland Network Contributors
