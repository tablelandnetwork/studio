import { NextRequest, NextResponse } from "next/server";
import { generateNonce, ErrorTypes, SiweMessage } from "siwe";
import { getIronSession } from "iron-session/edge";
import sessionConfig from "@/config/iron-session";

export async function GET(req: NextRequest) {
  // const nonce = generateNonce();
  // const res = new NextResponse(nonce);
  // const session = await getIronSession(req, res, sessionConfig);
  // session.nonce = nonce;
  // await session.save();
  // return res;
}
