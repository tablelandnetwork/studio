# `@tableland/studio-mail`

[![License: MIT AND Apache-2.0](https://img.shields.io/badge/License-MIT%20AND%20Apache--2.0-blue.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Ftablelandnetwork%2Fstudio%2Fmain%2Fpackages%2Fmail%2Fpackage.json&query=%24.version&label=Version)](./package.json)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg)](https://github.com/RichardLitt/standard-readme)

> Encapsulates email sending in Studio.

## Background

This package only exports a single function `initMailApi`, which takes an optional `apiKey` for [Postmark](https://postmarkapp.com/). If the API key _is not_ provided, emails will be logged to the console. If an API key _is_ provided, emails will actually be sent.

## Install

You can install via npm.

```
npm install @tableland/studio-mail
```

## Usage

```typescript
import { initMailApi } from "@tableland/studio-mail";

const mailApiKey = "your_postmark_api_key"; // Or, initialize without a key to log to console
const mailApi = initMailApi(mailApiKey);

await mailApi.sendInvite(
  "email@example.com", // User's email
  "https://example.com/image", // Link to invite image
  "inviter-username", // Username of who is inviting
  "org-name", // Org name string
  "https://example.com/accept", // Link to accept invite
);
```

## Development

See the `web` package for the store is used in the context of Studio.

## Contributing

PRs accepted. Studio is still under initial development, so if you are interested in helping out, feel free to connect on Discord:
[https://tableland.xyz/discord](https://tableland.xyz/discord)

Small note: If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT AND Apache-2.0, © 2021-2024 Tableland Network Contributors
