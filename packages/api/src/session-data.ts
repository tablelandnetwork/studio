import { type SessionOptions } from "iron-session";
import { type schema } from "@tableland/studio-store";
import { type SiweMessage } from "siwe";

const SESSION_COOKIE_NAME = "STUDIO_SESSION";

export type SiweFields = Omit<
  SiweMessage,
  "constructor" | "toMessage" | "prepareMessage" | "validate" | "verify"
>;

export interface Auth {
  user: schema.User;
  personalOrg: schema.Org;
  personalTeam?: schema.Org;
}

export interface SessionData {
  nonce?: string;
  siweFields?: SiweFields;
  auth?: Auth;
  projectEnvs?: Record<string, string>;
}

export const defaultSession: SessionData = {
  nonce: undefined,
  siweFields: undefined,
  auth: undefined,
  projectEnvs: undefined,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_COOKIE_PASS!,
  cookieName: process.env.SESSION_COOKIE_NAME ?? SESSION_COOKIE_NAME,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
