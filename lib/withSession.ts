import { Team, User } from "@/db/schema";
import { IronSessionOptions, getIronSession } from "iron-session";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { SiweMessage } from "siwe";

type SiweFields = Omit<
  SiweMessage,
  "constructor" | "toMessage" | "prepareMessage" | "validate" | "verify"
>;

export type Auth = {
  user: User;
  personalTeam: Team;
};

export interface IronSessionData {
  nonce?: string;
  siweFields?: SiweFields;
  auth?: Auth;
}

export const sessionOptions: IronSessionOptions = {
  cookieName: process.env.SESSION_COOKIE_NAME || "",
  password: process.env.SESSION_COOKIE_PASS || "",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export const getServerSession = cache(async () => {
  console.log("GETTING SERVER SESSION");
  const req = {
    headers: Object.fromEntries(headers() as Headers),
    cookies: Object.fromEntries(
      cookies()
        .getAll()
        .map((c) => [c.name, c.value])
    ),
  };
  const res = {
    getHeader: headers().get,
    setCookie: cookies().set,
    setHeader: headers().set,
  };
  const session = await getIronSession<IronSessionData>(
    req as unknown as Request,
    res as unknown as Response,
    sessionOptions
  );

  return session;
});
