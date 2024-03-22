# `@tableland/studio-api`

[![License: MIT AND Apache-2.0](https://img.shields.io/badge/License-MIT%20AND%20Apache--2.0-blue.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Ftablelandnetwork%2Fstudio%2Fmain%2Fpackages%2Fapi%2Fpackage.json&query=%24.version&label=Version)](./package.json)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg)](https://github.com/RichardLitt/standard-readme)

> Tableland Studio tRPC API endpoints.

## Background

If you are trying to run the API, refer to the `web` package.

## Install

You can install via npm.

```
npm install @tableland/studio-api
```

## Usage

The Studio API is run via a Next.js router. See below for an example.

```
// Set up file
import { appRouter } from "@tableland/studio-api";
import { getBaseUrl } from "@tableland/studio-client";
import { store } from "./store";

const baseUrl = getBaseUrl();

export const apiRouter = appRouter(
  store,
  process.env.POSTMARK_API_KEY!,
  `${baseUrl}/mesa.jpg`,
  (seal) => `${baseUrl}/invite?seal=${seal}`,
  process.env.DATA_SEAL_PASS!,
  process.env.NODE_ENV === "development",
);

// Next route file
import { createContext } from "@tableland/studio-api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { apiRouter } from "location/of/setup/file";

const handler = async (req: Request) => {
  console.log(`incoming request ${req.url}`);
  return await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: apiRouter,
    createContext,
    onError: function (opts) {
      console.error("Error:", JSON.stringify(opts, null, 4));
    },
  });
};

export { handler as GET, handler as POST };
```

## Development

See the `web` package for how the API is used in the context of Studio.

## Contributing

PRs accepted. Studio is still under initial development, so if you are interested in helping out, feel free to connect on Discord:
[https://tableland.xyz/discord](https://tableland.xyz/discord)

Small note: If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT AND Apache-2.0, © 2021-2024 Tableland Network Contributors
