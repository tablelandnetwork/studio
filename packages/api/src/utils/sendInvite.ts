import { type MailApi } from "@tableland/studio-mail";
import { type Store, type schema } from "@tableland/studio-store";
import { sealData } from "iron-session";

export function createSendInvite(
  store: Store,
  dataSealPass: string,
  inviteImageLink: string,
  createInviteLink: (seal: string) => string,
  mailApi: MailApi,
) {
  return async function (invite: schema.OrgInvite) {
    const inviterOrg = await store.orgs.orgById(invite.inviterOrgId);
    if (!inviterOrg) {
      throw new Error("Inviter org not found");
    }
    const org = await store.orgs.orgById(invite.orgId);
    if (!org) {
      throw new Error("Org not found");
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
      inviterOrg.name,
      org.name,
      link,
    );
  };
}

export type SendInviteFunc = ReturnType<typeof createSendInvite>;
