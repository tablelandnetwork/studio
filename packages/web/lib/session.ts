import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { type SessionData, sessionOptions } from "@tableland/studio-api";

export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  return session;
}
