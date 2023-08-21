import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@tableland/studio/server';
import { getUrl } from "./util"
 
const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getUrl(),
    }),
  ],
});

export { getUrl, trpc }