import "@/styles/globals.css";

import { trpc } from "@/utils/trpc";
import { Provider } from "jotai";
import { NextPage } from "next";
import type { AppProps } from "next/app";
import { ReactElement } from "react";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement, props: any) => ReactElement;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function App({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <Provider>{getLayout(<Component {...pageProps} />, pageProps)}</Provider>
  );
}

export default trpc.withTRPC(App);
