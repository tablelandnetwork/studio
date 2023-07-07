"use server";

import db from "@/db/api";
import Session, { Auth } from "@/lib/session";
import { cookies } from "next/headers";
import { SiweMessage, generateNonce } from "siwe";

export async function authenticated() {
  const session = await Session.fromCookies(cookies());
  return session.auth;
}

export async function nonce() {
  const session = await Session.fromCookies(cookies());
  session.nonce = generateNonce();
  await session.persist(cookies());
  return session.nonce;
}

export async function login(
  message: string,
  signature: string
): Promise<{ auth?: Auth; error?: string }> {
  const session = await Session.fromCookies(cookies());
  try {
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({
      signature,
      nonce: session.nonce,
      // TODO: do we want to verify domain and time here?
    });
    session.siweFields = fields.data;
    let info = await db.auth.userAndPersonalTeamByAddress(fields.data.address);
    if (info) {
      session.auth = info;
    }
    return { auth: session.auth };
  } catch (e: any) {
    session.auth = undefined;
    session.nonce = undefined;
    return { error: e.message };
  } finally {
    await session.persist(cookies());
  }
}

export async function register(
  username: string,
  email?: string
): Promise<{ auth?: Auth; error?: string }> {
  const session = await Session.fromCookies(cookies());
  if (!session.siweFields) {
    return { error: "No SIWE fields found in session" };
  }
  const auth = await db.auth.createUserAndPersonalTeam(
    session.siweFields.address,
    username,
    email
  );
  session.auth = auth;
  await session.persist(cookies());
  return { auth };
}
