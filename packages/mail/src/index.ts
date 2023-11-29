import { render } from "@react-email/render";
import * as postmark from "postmark";
import Invite from "./emails/invite";


// here is a comment that we want to merge

export function initMailApi(apiKey?: string) {
  const client = getClient(apiKey);
  return {
    sendInvite: async (
      to: string,
      imageLink: string,
      inviterUsername: string,
      teamName: string,
      link: string,
    ) => {
      const emailHtml = render(
        Invite({ imageLink, inviterUsername, teamName, link }),
      );
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

const getClient = function (apiKey?: string) {
  if (typeof apiKey !== "string" || apiKey.trim() === "") {
    return {
      sendEmail: function (data: any) {
        console.log("Development Mode Email:", JSON.stringify(data, null, 4));
      },
    };
  }
  return new postmark.ServerClient(apiKey);
};

export type MailApi = ReturnType<typeof initMailApi>;
