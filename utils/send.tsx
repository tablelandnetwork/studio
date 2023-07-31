import db from "@/db/api";
import { TeamInvite } from "@/db/schema";
import Invite from "@/emails/invite";
import { render } from "@react-email/render";
import { sealData } from "iron-session";
import * as postmark from "postmark";

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY || "");

export async function sendInvite(invite: TeamInvite) {
  const inviterTeam = await db.teams.teamById(invite.inviterTeamId);
  const team = await db.teams.teamById(invite.teamId);
  const seal = await sealData(
    { inviteId: invite.id },
    {
      password: process.env.DATA_SEAL_PASS as string,
      ttl: 0,
    }
  );
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:${process.env.PORT ?? 3000}`;

  const emailHtml = render(
    Invite({
      inviterUsername: inviterTeam.name,
      teamName: team.name,
      link: `${baseUrl}/invite?seal=${seal}`,
    })
  );

  const res = await client.sendEmail({
    From: "noreply@tableland.xyz",
    To: invite.email,
    Subject: "You've been invited to a team on Tableland Studio",
    HtmlBody: emailHtml,
  });
  console.log("sendMail result:", res);
}
