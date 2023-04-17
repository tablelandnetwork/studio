import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
} from "next";
import { IronSessionOptions } from "iron-session";
import type { SiweMessage } from "siwe";

declare module "iron-session" {
  interface IronSessionData {
    nonce: string | null;
    siweMessage: SiweMessage | null;
    userId: string | null;
    personalTeamId: string | null;
  }
}

const sessionOptions: IronSessionOptions = {
  cookieName: process.env.SESSION_COOKIE_NAME || "",
  password: process.env.SESSION_COOKIE_PASS || "",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export function withSessionRoute(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, sessionOptions);
}

export function withSessionSsr(
  handler: (
    context: GetServerSidePropsContext
  ) =>
    | GetServerSidePropsResult<{ [key: string]: unknown }>
    | Promise<GetServerSidePropsResult<{ [key: string]: unknown }>>
) {
  return withIronSessionSsr(handler, sessionOptions);
}

export { sessionOptions };
