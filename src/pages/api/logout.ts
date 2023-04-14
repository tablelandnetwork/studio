import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "@/lib/withSession";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  switch (method) {
    case "GET":
      req.session.destroy();
      res.status(200).end();
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: `Method ${method} Not Allowed` });
      break;
  }
};

export default withSessionRoute(handler);
