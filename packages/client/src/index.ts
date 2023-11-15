import { type helpers } from "@tableland/sdk";
import { type AppRouter } from "@tableland/studio-api";
import {
  createTRPCProxyClient,
  httpBatchLink,
  type HTTPHeaders,
  type Operation,
} from "@trpc/client";
import superjson from "superjson";
import { sqliteKeywords } from "./sqlite-keywords.js";
import { getBaseUrl, getUrl } from "./util.js";

type NonEmptyArray<TItem> = [TItem, ...TItem[]];
interface ClientConfig {
  fetch?: (res: Response) => Response;
  headers?:
    | HTTPHeaders
    | ((opts: {
        opList: NonEmptyArray<Operation>;
      }) => HTTPHeaders | Promise<HTTPHeaders>);
  url?: string;
}

type ProxyClient = ReturnType<typeof createTRPCProxyClient<AppRouter>>;

const api = function (config: ClientConfig = {}): ProxyClient {
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

type API = ReturnType<typeof api>;

// TODO: there is currently no concept of an environment for a user
function studioAliases({
  environmentId,
  apiUrl,
}: {
  environmentId: string;
  apiUrl?: string;
}): helpers.AliasesNameMap {
  const studioApi = api({
    url: apiUrl,
  });
  const loadMap = async function (): Promise<void> {
    const res = await studioApi.deployments.deploymentsByEnvironmentId.query({
      environmentId,
    });

    _map = {};
    res.forEach(function (dep) {
      _map[dep.table.name] = dep.deployment.tableName;
    });
  };

  let _map: helpers.NameMapping;
  return {
    read: async function (): Promise<helpers.NameMapping> {
      if (typeof _map === "undefined") await loadMap();

      return _map;
    },
    write: async function () {
      throw new Error("cannot create project tables via studio sdk aliases");
    },
  };
}

export {
  api,
  type API,
  type ClientConfig,
  getBaseUrl,
  getUrl,
  sqliteKeywords,
  studioAliases,
};
