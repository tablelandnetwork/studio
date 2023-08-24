import Session from "@/lib/session";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import {
  RequestCookies,
  ResponseCookies,
} from "next/dist/compiled/@edge-runtime/cookies";
import { RequestCookiesAdapter } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export async function createContext(opts?: FetchCreateContextFnOptions) {
  // TODO: Get session and add it to context
  // const session = await auth();

  var session: Session;
  var responseCookies: ResponseCookies;
  if (opts) {
    const readonlyRequestCookies = RequestCookiesAdapter.seal(
      new RequestCookies(opts.req.headers),
    );
    session = await Session.fromCookies(readonlyRequestCookies);
    responseCookies = new ResponseCookies(opts.resHeaders);
  } else {
    session = new Session();
    responseCookies = new ResponseCookies(new Headers());
  }

  return {
    session,
    responseCookies,
    headers: opts && Object.fromEntries(opts.req.headers),
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
