# Tableland Studio

Build projects on Tableland with the Studio web app and accompanying CLI tool.

## Repo layout

The `packages` directory contains the different packages used by studio.
 - `api`: the Studio backend api, written with tRPC
 - `chains`: static info on Tableland supported chains, and helpers to get node providers
 - `cli`: command line Studio client written with node.js
 - `client`: http client for the studio api
 - `mail`: email sending interfaces
 - `store`: an internal Studio data store
 - `web`: a web base Studio client written with Next.js

## Contributing

PRs accepted.

Small note: If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT AND Apache-2.0, © 2021-2023 Tableland Network Contributors
