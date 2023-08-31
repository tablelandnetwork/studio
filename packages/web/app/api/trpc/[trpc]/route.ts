import { apiRouter } from "@/lib/api-router";
import { createContext } from "@tableland/studio-api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request) => {
  console.log(`incoming request ${req.url}`);
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: apiRouter,
    createContext,
  });
};

export { handler as GET, handler as POST };
