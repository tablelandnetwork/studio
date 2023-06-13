## Getting Started

The following instructions will get Studio running on your development machine.

1. Clone this repo, you're probably interested in the `main` branch.
2. ensure yarn is installed globally, `npm install -g yarn`
3. Run `npm install`.
4. Create a `.env.local` file in the root of the project with the following content:

```
PRIVATE_KEY=0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356
PROVIDER_URL=http://127.0.0.1:8545
CHAIN=local-tableland
SESSION_COOKIE_NAME=STUDIO_SESSION
SESSION_COOKIE_PASS="secure password secure password secure password"
DATA_SEAL_PASS="secure password secure password secure password"
```

5. In a separate terminal, start `local-tableland` with `npx local-tableland`
6. Back in your primary terminal, clear any previous information about tables that were created on `local-tabland` by removing `tables_local.json` with `rm tables_local.json`.
7. Create the Studio tables on `local-tableland` by running `npm run tables`.
8. Start the Studio webb app with `npm run dev`.
9. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**NOTE:** Steps 5 and 6 have to be preformed any time you stop and restart `local-tableland`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
