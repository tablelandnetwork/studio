import { render } from "@react-email/render";
import * as postmark from "postmark";
import Invite from "./emails/invite";

export function initMailApi(apiKey?: string) {
  const client = getClient(apiKey);
  return {
    sendInvite: async (
      to: string,
      imageLink: string,
      inviterUsername: string,
      orgName: string,
      link: string,
    ) => {
      // TODO: error occurs in `render` or `Invite` function via `org.test.ts`:
      // ```
      //  Element type is invalid: expected a string (for built-in components)
      //  or a class/function (for composite components) but got: undefined. You
      //  likely forgot to export your component from the file it's defined in,
      //  or you might have mixed up default and named imports.
      // ```
      const emailHtml = render(
        Invite({ imageLink, inviterUsername, orgName, link }),
      );
      const res = await client.sendEmail({
        From: "noreply@tableland.xyz",
        To: to,
        Subject: "You've been invited to an org on Tableland Studio",
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
