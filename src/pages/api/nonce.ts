import { NextApiRequest, NextApiResponse } from "next";
import { generateNonce } from "siwe";
import { withSessionRoute } from "@/lib/with-session";

export default withSessionRoute(handler);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  switch (method) {
    case "GET":
      req.session.nonce = generateNonce();
      await req.session.save();
      res.status(200).json({ result: req.session.nonce });
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
