## Overview

A Tableland Studio tRPC API endpoints.  If you are trying to run the API, refer to the `web` package.

## Install

You can install via npm.

```
npm install @tableland/studio-api
```

## Usage

The Studio api is run via a Next.js router.  See below for an example.
```
// setup file
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

// next route file
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


## Contributing

Studio is still under initial development, if you are interested in helping out feel free to connect on discord
https://discord.gg/kjgrnPhs

## License

MIT AND Apache-2.0, © 2021-2022 Tableland Network Contributors
