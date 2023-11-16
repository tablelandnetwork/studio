import { createContext } from "@tableland/studio-api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { apiRouter } from "@/lib/api-router";

const handler = async (req: Request) => {
  console.log(`incoming request ${req.url}`);
  return await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: apiRouter,
    createContext,
  });
};

export { handler as GET, handler as POST };
