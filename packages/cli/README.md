# `@tableland/studio-cli`

[![License: MIT AND Apache-2.0](https://img.shields.io/badge/License-MIT%20AND%20Apache--2.0-blue.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Ftablelandnetwork%2Fstudio%2Fmain%2Fpackages%2Fcli%2Fpackage.json&query=%24.version&label=Version)](./package.json)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg)](https://github.com/RichardLitt/standard-readme)

> A Tableland Studio command line tool.

## Background

The Studio command line lets you interact with your Studio teams, projects, and tables. The full, up-to-date docs can be found: [here](https://docs.tableland.xyz/studio/cli).

## Install

You can install via npm.

```
npm install -g @tableland/studio-cli
```

## Usage

First, you will need a Studio account, which you can create for free here: [https://studio.tableland.xyz](https://studio.tableland.xyz)

Once you have an account read the output of the help command:

```shell
$ npx studio --help
studio <command>

Commands:
  studio login                              create a login session via private
                                            key
  studio logout                             logout current session
  studio team <sub>                         manage studio teams
  studio init                               create a tablelandrc config file
  studio project <sub>                      manage studio projects
  studio deployment <sub>                   manage studio deployments
  studio import-data <table> <file>         write the content of a csv into an
                                            existing table
  studio query                              open a shell to run sql statements
                                            against your selected project
  studio import-table <table> <project>     import an existing tableland table
  <description> [name]                      into a project with description and
                                            optionally with a new name
  studio use [context] [id]                 use the given context id for all
                                            ensuing commands. context can be one
                                             of (team, project, or api).
  studio unuse [context]                    remove any existing id from the
                                            given context

Options:
  -h, --help              Show help                                    [boolean]
  -V, --version           Show version number                          [boolean]
  -a, --apiUrl            RPC URL for the Studio API      [string] [default: ""]
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

Your first step is probably going to be either running the `init` command (`npx studio init`), or to login (`npx studio login --privateKey <include the private key you used to create your studio account>`).
Note that the `init` command will ask you some questions, and potentially store your private key in the `.tablelandrc.json` [config file](https://docs.tableland.xyz/studio/cli#config). If you pass your private key to the `login` command we won't store your private key anywhere.
If you plan to submit blockchain transactions via the cli you will probably want to store your private key in the config file, if you don't plan to send transactions you only need your private key to login, and there's no need to store it in the config file.

At this point you are ready to use all the cli commands. Refer to the [docs](https://docs.tableland.xyz/studio/cli) for the most recent usage recommendations. If you have any problems you can open an issue here, or chat with us in [Discord](https://discord.gg/kjgrnPhs).

## Contributing

PRs accepted. Studio is still under initial development, so if you are interested in helping out, feel free to connect on Discord:
[https://tableland.xyz/discord](https://tableland.xyz/discord)

Small note: If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT AND Apache-2.0, © 2021-2024 Tableland Network Contributors
