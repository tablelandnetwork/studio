import { AppRouter } from "@tableland/studio-api";
import {
  createTRPCProxyClient,
  httpBatchLink,
  HTTPHeaders,
  Operation,
} from "@trpc/client";
import superjson from "superjson";
import { getBaseUrl, getUrl } from "./util.js";

type NonEmptyArray<TItem> = [TItem, ...TItem[]];
type ClientConfig = {
  fetch?: (res: Response) => Response;
  headers?: HTTPHeaders | ((opts: { opList: NonEmptyArray<Operation>; }) => HTTPHeaders | Promise<HTTPHeaders>);
  url?: string
};

type ProxyClient = ReturnType<typeof createTRPCProxyClient<AppRouter>>;

const api = function (
  config: ClientConfig = {}
) {
  const apiUrl = typeof config.url === "string" ? getUrl(config.url) : getUrl();

  return createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: apiUrl,
        fetch: async function (url, options) {
          const res = await fetch(url, options);

          if (typeof config?.fetch === "function") {
            return config.fetch(res);
          }
          return res;
        },
        headers: config?.headers,
      }),
    ],
  });
};

export { api, API, getBaseUrl, getUrl, ClientConfig };

