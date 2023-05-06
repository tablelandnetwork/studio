import { teamById } from "@/db/api";
import { TeamInvite } from "@/db/schema";
import sendMail from "@/emails";
import Invite from "@/emails/Invite";
import { sealData } from "iron-session";

export async function sendInvite(invite: TeamInvite) {
  const inviterTeam = await teamById(invite.inviterTeamId);
  const team = await teamById(invite.teamId);
  const seal = await sealData(
    { invite },
    {
      password: process.env.DATA_SEAL_PASS as string,
      ttl: 0,
    }
  );
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:${process.env.PORT ?? 3000}`;
  const res = await sendMail({
    to: invite.email,
    component: (
      <Invite
        inviterUsername={inviterTeam.name}
        teamName={team.name}
        link={`${baseUrl}/invite?seal=${seal}`}
      />
    ),
  });
  console.log("sendMail result:", res);
}
