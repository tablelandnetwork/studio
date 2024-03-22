# `@tableland/studio-client`

[![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Ftablelandnetwork%2Fstudio%2Fmain%2Fpackages%2Fclient%2Fpackage.json&query=%24.version&label=Version)](./package.json)

> HTTP client for the Studio API.

## Background

This is an HTTP client set up to connect to the tRPC server that exists in the `api` package of this repo.

## Install

You can install via npm.

```
npm install @tableland/studio-client
```

## Usage

This package is fairly small and it only exports two functions:

- `api`: a function that takes a config Object and returns an api Object that maps one-to-one to the tRPC endpoints.
- `studioAliases`: a function that takes an environment id and apiUrl, and returns a Tableland SDK aliases Object that can be used to setup a Database instance for a given Project Environment. If you're not familiar with the SDK's concept of aliases, more info on them can be found in the [docs](https://docs.tableland.xyz/sdk/database/aliases). They make using Tableland a D1 compatible ORM seamless.

Example usage of `api`:

```
import { api } from "@tableland/studio-client";

const studioRpc = api({
  // optionally intercept and modify api responses
  fetch: function (res) {},
  // an optional object, or function that returns an object, containing the
  // headers you want sent with api requests
  headers: function () {},
  url: "http://localhost:3000"
}):

const projects = await studioRpc.projects.teamProjects.query({ teamId: "123abc" });

```

Example usage of `studioAliases`:

```
import { studioAliases } from "@tableland/studio-client";


const aliasMap = studioAliases({
  environmentId: "123abc",
  apiUrl: "http://localhost:3000"
});

const db = new Database({
  aliases: studioAliasMapper,
  // if you want to do writes include a signer
  signer: mySignerOrWallet
});

// use the SDK normally, but table names are scoped to the project environment
const results = db.prepare("select * from students;").all();

console.log(results);
```

## Development

See the `web` package for how the client is used in the context of Studio.

## Contributing

PRs accepted. Studio is still under initial development, so if you are interested in helping out, feel free to connect on Discord:
[https://tableland.xyz/discord](https://tableland.xyz/discord)

Small note: If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT AND Apache-2.0, © 2021-2024 Tableland Network Contributors
