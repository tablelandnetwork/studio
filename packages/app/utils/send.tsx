import Invite from "@/emails/invite";
import { store } from "@/lib/store";
import { render } from "@react-email/render";
import { schema } from "@tableland/studio-store";
import { sealData } from "iron-session";
import * as postmark from "postmark";

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY || "");

export async function sendInvite(invite: schema.TeamInvite) {
  const inviterTeam = await store.teams.teamById(invite.inviterTeamId);
  if (!inviterTeam) {
    throw new Error("Inviter team not found");
  }
  const team = await store.teams.teamById(invite.teamId);
  if (!team) {
    throw new Error("Team not found");
  }
  const seal = await sealData(
    { inviteId: invite.id },
    {
      password: process.env.DATA_SEAL_PASS as string,
      ttl: 0,
    },
  );
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:${process.env.PORT ?? 3000}`;

  const emailHtml = render(
    Invite({
      inviterUsername: inviterTeam.name,
      teamName: team.name,
      link: `${baseUrl}/invite?seal=${seal}`,
    }),
  );

  const res = await client.sendEmail({
    From: "noreply@tableland.xyz",
    To: invite.email,
    Subject: "You've been invited to a team on Tableland Studio",
    HtmlBody: emailHtml,
  });
  console.log("sendMail result:", res);
}
