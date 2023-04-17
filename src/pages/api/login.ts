import { NextApiRequest, NextApiResponse } from "next";
import { SiweErrorType, SiweMessage, SiweResponse } from "siwe";
import { sessionOptions, withSessionRoute } from "@/lib/withSession";
import { getIronSession, IronSessionOptions } from "iron-session";
import {
  createUserAndPersonalTeam,
  userAndPersonalTeamByAddress,
} from "@/db/api";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  switch (method) {
    case "POST":
      let fields: SiweResponse;
      try {
        const { message, signature } = req.body;
        if (!message) {
          res
            .status(422)
            .json({ error: "Expected prepareMessage object as body." });
          break;
        }
        const siweMessage = new SiweMessage(message);
        fields = await siweMessage.verify({
          signature,
          nonce: req.session.nonce || undefined,
          // TODO: do we want to verify domain and time here?
        });
      } catch (e: any) {
        const session = await getIronSession(req, res, sessionOptions);
        session.siweMessage = null;
        session.nonce = null;
        await session.save();
        let status: number;
        switch (e) {
          case SiweErrorType.EXPIRED_MESSAGE:
          case SiweErrorType.NOT_YET_VALID_MESSAGE: {
            status = 440;
            break;
          }
          case SiweErrorType.INVALID_SIGNATURE:
          case SiweErrorType.DOMAIN_MISMATCH:
          case SiweErrorType.INVALID_ADDRESS:
          case SiweErrorType.INVALID_DOMAIN:
          case SiweErrorType.INVALID_MESSAGE_VERSION:
          case SiweErrorType.INVALID_NONCE:
          case SiweErrorType.INVALID_TIME_FORMAT:
          case SiweErrorType.INVALID_URI:
          case SiweErrorType.NONCE_MISMATCH:
          case SiweErrorType.UNABLE_TO_PARSE: {
            status = 422;
            break;
          }
          default: {
            status = 500;
            break;
          }
        }
        res.status(status).json({ error: e.message });
        break;
      }
      const finalOptions: IronSessionOptions = {
        ...sessionOptions,
        cookieOptions: {
          ...sessionOptions.cookieOptions,
          expires: fields.data.expirationTime
            ? new Date(fields.data.expirationTime)
            : sessionOptions.cookieOptions?.expires,
        },
      };
      const session = await getIronSession(req, res, finalOptions);
      session.siweMessage = fields.data;

      let info = await userAndPersonalTeamByAddress(fields.data.address);
      if (!info) {
        info = await createUserAndPersonalTeam(fields.data.address);
      }
      session.userId = info.user.id;
      session.personalTeamId = info.personalTeam.id;

      await session.save();
      res.status(200).end();
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

export default withSessionRoute(handler);
