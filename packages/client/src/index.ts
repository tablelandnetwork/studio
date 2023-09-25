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

type ProxyClient = ReturnType<typeof createTRPCProxyClient<AppRouter>>;

const api = function (
  config: {
    fetch?: (res: Response) => Response;
    headers?:
      | HTTPHeaders
      | ((opts: {
          opList: NonEmptyArray<Operation>;
        }) => HTTPHeaders | Promise<HTTPHeaders>);
  } = {},
): ProxyClient {
  return createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: getUrl(),
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

type API = ReturnType<typeof api>;

export { api, API, getBaseUrl, getUrl };
