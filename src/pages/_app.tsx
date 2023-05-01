import "@/styles/globals.css";

import type { AppProps } from "next/app";

import Layout from "@/components/layout";
import { trpc } from "@/utils/trpc";

function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default trpc.withTRPC(App);
