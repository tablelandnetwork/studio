import { render } from "@react-email/render";
import * as postmark from "postmark";
import Invite from "./emails/invite";

export function initMailApi(apiKey: string) {
  const client = new postmark.ServerClient(apiKey);
  return {
    sendInvite: async (
      to: string,
      inviterUsername: string,
      teamName: string,
      link: string,
    ) => {
      const emailHtml = render(Invite({ inviterUsername, teamName, link }));
      const res = await client.sendEmail({
        From: "noreply@tableland.xyz",
        To: to,
        Subject: "You've been invited to a team on Tableland Studio",
        HtmlBody: emailHtml,
      });
      return res;
    },
  };
}

export type MailApi = ReturnType<typeof initMailApi>;
