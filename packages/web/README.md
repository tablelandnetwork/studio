## Overview

This is the studio web application. It has been build with [Next.js](https://nextjs.org/), and [tRPC](https://trpc.io/). The following Getting Starting section will run the Next web server and the tRPC api server.

## Usage

The following instructions will get Studio running on your development machine.

1. Clone this repo, you're probably interested in the `main` branch.
2. Run `npm install`.
3. Create a `.env.local` file in the root of the project with the following content:

```
PRIVATE_KEY=0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356
PROVIDER_URL=http://127.0.0.1:8545
CHAIN_ID=31337
SESSION_COOKIE_NAME=STUDIO_SESSION
SESSION_COOKIE_PASS="secure password secure password secure password secure password secure password secure password secure password"
DATA_SEAL_PASS="secure password secure password secure password secure password secure password secure password secure password"
DATA_SEAL_PASS="secure password secure password secure password"
```

4. run `npm run dev:all` to start a local only validator, deploy the needed contracts, create all the internal studio tables, and start the web app
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License

MIT AND Apache-2.0, © 2021-2023 Tableland Network Contributors
