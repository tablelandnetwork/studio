import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "@/lib/with-session";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  switch (method) {
    case "GET":
      if (!req.session.siweMessage) {
        res.status(401).json({ error: "You have to login first" });
      } else {
        res.json({ result: req.session.siweMessage });
      }
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
};

export default withSessionRoute(handler);
