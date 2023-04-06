import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session/edge";
import { IronSessionOptions } from "iron-session";
import sessionConfig from "@/config/iron-session";
import { generateNonce, ErrorTypes, SiweMessage } from "siwe";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/api/nonce") {
    const nonce = generateNonce();
    const res = new NextResponse(nonce);
    const session = await getIronSession(req, res, sessionConfig);
    session.nonce = nonce;
    await session.save();
    return res;
  }

  if (req.nextUrl.pathname === "/api/login") {
    try {
      const reqJson = await req.json();
      if (!reqJson.body.message) {
        return NextResponse.json(
          { message: "Expected prepareMessage object as body." },
          { status: 422 }
        );
      }
      let message = new SiweMessage(reqJson.body.message);
      const fields = await message.validate(reqJson.body.signature);
      if (fields.nonce !== reqJson.session.nonce) {
        console.log(reqJson.session);
        return NextResponse.json(
          { message: "Invalid nonce." },
          { status: 422 }
        );
      }
      const finalConfig: IronSessionOptions = {
        ...sessionConfig,
        cookieOptions: {
          ...sessionConfig.cookieOptions,
          expires: fields.expirationTime
            ? new Date(fields.expirationTime)
            : sessionConfig.cookieOptions?.expires,
        },
      };
      const res = new NextResponse();
      const session = await getIronSession(req, res, finalConfig);
      session.siweMessage = fields;
      await session.save();
      return res;
    } catch (e: any) {
      console.error(e);
      let status: number;
      switch (e) {
        case ErrorTypes.EXPIRED_MESSAGE: {
          status = 440;
          break;
        }
        case ErrorTypes.INVALID_SIGNATURE: {
          status = 422;
          break;
        }
        case ErrorTypes.MALFORMED_SESSION: {
          status = 422;
          break;
        }
        default: {
          status = 500;
          break;
        }
      }
      const res = new NextResponse(undefined, { status });
      const session = await getIronSession(req, res, sessionConfig);
      session.siweMessage = null;
      session.nonce = null;
      await session.save();
      return res;
    }
  }
}
