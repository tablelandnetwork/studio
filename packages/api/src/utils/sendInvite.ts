import { MailApi } from "@tableland/studio-mail";
import { Store, schema } from "@tableland/studio-store";
import { sealData } from "iron-session";

export function createSendInvite(
  store: Store,
  dataSealPass: string,
  inviteImageLink: string,
  createInviteLink: (seal: string) => string,
  mailApi: MailApi,
) {
  return async function (invite: schema.TeamInvite) {
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
        password: dataSealPass,
        ttl: 0,
      },
    );
    const link = createInviteLink(seal);

    return await mailApi.sendInvite(
      invite.email,
      inviteImageLink,
      inviterTeam.name,
      team.name,
      link,
    );
  };
}

export type SendInviteFunc = ReturnType<typeof createSendInvite>;
