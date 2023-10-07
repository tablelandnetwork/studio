import { helpers } from "@tableland/sdk";
import { AppRouter } from "@tableland/studio-api";
import {
  createTRPCProxyClient,
  httpBatchLink,
  HTTPHeaders,
  Operation,
} from "@trpc/client";
import superjson from "superjson";
import { getUrl } from "./util.js";

const DEFAULT_API_BASE_URL = "https://studio.tableland.xyz";

type NonEmptyArray<TItem> = [TItem, ...TItem[]];
type ClientConfig = {
  fetch?: (res: Response) => Response;
  headers?:
    | HTTPHeaders
    | ((opts: {
        opList: NonEmptyArray<Operation>;
      }) => HTTPHeaders | Promise<HTTPHeaders>);
  url?: string;
};

type ProxyClient = ReturnType<typeof createTRPCProxyClient<AppRouter>>;

const api = function (config: ClientConfig): {
  api: ProxyClient;
  apiUrl: string;
} {
  const apiUrl = getUrl(config.url || DEFAULT_API_BASE_URL);

  return {
    api: createTRPCProxyClient<AppRouter>({
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
    }),
    apiUrl,
  };
};

type API = ReturnType<typeof api>;

// TODO: there is currently no concept of an environment for a user
function studioAliases({
  environmentId,
  apiBaseUrl,
}: {
  environmentId: string;
  apiBaseUrl?: string;
}): helpers.AliasesNameMap {
  const { api: studioApi } = api({
    url: apiBaseUrl || DEFAULT_API_BASE_URL,
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

export { api, API, ClientConfig, getUrl, studioAliases };
