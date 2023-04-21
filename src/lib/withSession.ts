import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
} from "next";
import { IronSessionOptions } from "iron-session";
import { SiweMessage } from "siwe";

type SiweFields = Omit<
  SiweMessage,
  "constructor" | "toMessage" | "prepareMessage" | "validate" | "verify"
>;

export type Auth = {
  siweFields: SiweFields;
  userId: string;
  personalTeamId: string;
};

declare module "iron-session" {
  interface IronSessionData {
    nonce: string | null;
    auth: Auth | null;
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
