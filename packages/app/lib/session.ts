import { sealData, unsealData } from "iron-session/edge";
import { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { NextRequest, NextResponse } from "next/server";
import { SiweMessage } from "siwe";
import { Team, User } from "../db/schema";
import { SESSION_COOKIE_NAME } from "../lib/consts";

export const SESSION_OPTIONS = {
  ttl: 60 * 60 * 24 * 30, // 30 days
  password: process.env.SESSION_COOKIE_PASS!,
};

type SiweFields = Omit<
  SiweMessage,
  "constructor" | "toMessage" | "prepareMessage" | "validate" | "verify"
>;

export type Auth = {
  user: User;
  personalTeam: Team;
};

export type ISession = {
  nonce?: string;
  siweFields?: SiweFields;
  auth?: Auth;
};

class Session {
  nonce?: string;
  siweFields?: SiweFields;
  auth?: Auth;

  constructor(session?: ISession) {
    this.nonce = session?.nonce;
    this.siweFields = session?.siweFields;
    this.auth = session?.auth;
  }

  static async fromCookies(cookies: ReadonlyRequestCookies): Promise<Session> {
    const sessionCookie = cookies.get(
      process.env.SESSION_COOKIE_NAME || SESSION_COOKIE_NAME,
    )?.value;

    if (!sessionCookie) return new Session();
    return new Session(
      await unsealData<ISession>(sessionCookie, SESSION_OPTIONS),
    );
  }

  static async fromRequest(req: NextRequest): Promise<Session> {
    const sessionCookie = req.cookies.get(
      process.env.SESSION_COOKIE_NAME || SESSION_COOKIE_NAME,
    )?.value;

    if (!sessionCookie) return new Session();
    return new Session(
      await unsealData<ISession>(sessionCookie, SESSION_OPTIONS),
    );
  }

  clear(res: NextResponse | ResponseCookies): Promise<void> {
    this.nonce = undefined;
    this.siweFields = undefined;
    this.auth = undefined;

    return this.persist(res);
  }

  toJSON(): ISession {
    return { nonce: this.nonce, siweFields: this.siweFields, auth: this.auth };
  }

  async persist(res: NextResponse | ResponseCookies): Promise<void> {
    let cookies: ResponseCookies;
    if (isCookies(res)) cookies = res;
    else cookies = res.cookies;

    cookies.set(
      process.env.SESSION_COOKIE_NAME || SESSION_COOKIE_NAME,
      await sealData(this.toJSON(), SESSION_OPTIONS),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    );
  }
}

const isCookies = (
  cookies: NextResponse | ResponseCookies,
): cookies is ResponseCookies => {
  return (cookies as ResponseCookies).set !== undefined;
};

export default Session;
