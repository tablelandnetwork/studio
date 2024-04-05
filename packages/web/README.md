# Studio web app

[![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Ftablelandnetwork%2Fstudio%2Fmain%2Fpackages%2Fweb%2Fpackage.json&query=%24.version&label=Version)](./package.json)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg)](https://github.com/RichardLitt/standard-readme)

> Tableland Studio web application.

## Background

This is the studio web application. It has been build with [Next.js](https://nextjs.org/), and [tRPC](https://trpc.io/). The following Getting Starting section will run the Next web server and the tRPC api server.

## Usage

Visit the [Tableland Studio](https://studio.tableland.xyz) to see the web app in action. For a deep dive on how to use it, check out the docs site: [here](https://docs.tableland.xyz/studio).

## Development

The following instructions will get Studio running on your development machine.

1. Clone this repo, you're probably interested in the `main` branch.
2. Run `npm install`.
3. Create a `.env.local` file in the root of the project with the following content:

```
STORE_PRIVATE_KEY=0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356
PROVIDER_URL=http://127.0.0.1:8545
CHAIN_ID=31337
SESSION_COOKIE_NAME=STUDIO_SESSION
SESSION_COOKIE_PASS="secure password secure password secure password secure password secure password secure password secure password"
DATA_SEAL_PASS="secure password secure password secure password secure password secure password secure password secure password"
DATA_SEAL_PASS="secure password secure password secure password"
KV_REST_API_URL="https://your-example-domain.upstash.io"
KV_REST_API_TOKEN="your_kv_api_token"
```

4. Run `npm run dev:all` to start a local only validator, deploy the needed contracts, create all the internal studio tables, and start the web app
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

PRs accepted. Studio is still under initial development, so if you are interested in helping out, feel free to connect on Discord:
[https://tableland.xyz/discord](https://tableland.xyz/discord)

Small note: If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT AND Apache-2.0, © 2021-2024 Tableland Network Contributors
