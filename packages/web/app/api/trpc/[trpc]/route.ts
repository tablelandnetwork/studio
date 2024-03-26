import {
  type SessionData,
  createTRPCContext as createContext,
  sessionOptions,
} from "@tableland/studio-api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { apiRouter } from "@/lib/api-router";

// TODO: Understand why this should be set to edge and figure out why the crypto module is not available in edge. Might need to upgrade nextjs.
// export const runtime = "edge";

/**
 * Configure basic CORS headers
 * You should extend this to match your needs
 */
const setCorsHeaders = (res: Response) => {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Request-Method", "*");
  res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  res.headers.set("Access-Control-Allow-Headers", "*");
};

export const OPTIONS = () => {
  const response = new Response(null, {
    status: 204,
  });
  setCorsHeaders(response);
  return response;
};

const handler = async (req: Request) => {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    router: apiRouter,
    req,
    createContext: async () => {
      const session = await getIronSession<SessionData>(
        cookies(),
        sessionOptions,
      );
      const context = await createContext({
        headers: req.headers,
        session,
      });
      return context;
    },
    onError({ error, path }) {
      console.error(`>>> tRPC Error on '${path ?? "[undefined path]"}'`, error);
    },
  });

  setCorsHeaders(response);
  return response;
};

export { handler as GET, handler as POST };
