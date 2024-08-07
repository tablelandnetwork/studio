import { cache } from "react";
import { headers, cookies } from "next/headers";
import { type RouterOutputs } from "@tableland/studio-api";
import { getSession } from "@tableland/studio-api";
import Info from "./_components/info";
import InviteActions from "./_components/invite-actions";
import NewInvite from "./_components/new-invite";
import UserActions from "./_components/user-actions";
import HashDisplay from "@/components/hash-display";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/server";
import { orgBySlug } from "@/lib/api-helpers";

export default async function People({ params }: { params: { org: string } }) {
  const session = await getSession({ cookies: cookies(), headers: headers() });
  const { auth } = session;

  const org = await orgBySlug(params.org);
  const people = await cache(api.orgs.usersForOrg)({
    orgId: org.id,
  });

  let invites: RouterOutputs["invites"]["invitesForOrg"]["invites"] = [];
  let orgAuthorization:
    | RouterOutputs["invites"]["invitesForOrg"]["orgAuthorization"]
    | undefined;
  if (auth) {
    try {
      const { invites: invitesRes, orgAuthorization: orgAuthorizationRes } =
        await cache(api.invites.invitesForOrg)({ orgId: org.id });
      invites = invitesRes;
      orgAuthorization = orgAuthorizationRes;
    } catch {}
  }

  const binnedInvites = invites.reduce<{
    pending: Array<(typeof invites)[number]>;
    claimed: Map<string, (typeof invites)[number]>;
  }>(
    (acc, invite) => {
      if (invite.claimedBy) {
        acc.claimed.set(invite.claimedBy.id, invite);
      } else {
        acc.pending.push(invite);
      }
      return acc;
    },
    { pending: [], claimed: new Map<string, (typeof invites)[number]>() },
  );

  const peopleAugmented = people.map((person) => {
    if (binnedInvites.claimed.has(person.personalOrg.id)) {
      return {
        ...person,
        claimedInvite: binnedInvites.claimed.get(person.personalOrg.id),
      };
    }
    return {
      ...person,
      claimedInvite: undefined,
    };
  });

  return (
    <main className="mx-auto w-full max-w-2xl p-4">
      <div className="flex flex-col space-y-6">
        {peopleAugmented.map((person) => {
          return (
            <div key={person.personalOrg.id} className="flex items-center">
              <Avatar className="-z-10">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${person.personalOrg.slug}.png`}
                  alt={person.personalOrg.name}
                />
                <AvatarFallback>
                  {person.personalOrg.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <p className="text-sm font-medium leading-none">
                  {person.personalOrg.name}
                  {person.personalOrg.id === auth?.personalOrg.id && " (You)"}
                </p>
                <HashDisplay
                  hash={person.address}
                  copy={true}
                  numCharacters={7}
                />
              </div>
              {orgAuthorization && (
                <div className="ml-auto text-sm text-muted-foreground">
                  {person.membership.isOwner ? "Admin" : "Member"}
                </div>
              )}
              <Info
                className={cn("ml-2", !orgAuthorization && "ml-auto")}
                user={auth?.personalOrg}
                userMembership={orgAuthorization}
                org={org}
                inviter={person.claimedInvite?.inviter}
                invite={person.claimedInvite?.invite}
                membership={person.membership}
              />
              {auth && orgAuthorization && (
                <UserActions
                  className="ml-2"
                  org={org}
                  user={auth.personalOrg}
                  userMembership={orgAuthorization}
                  member={person.personalOrg}
                  memberMembership={person.membership}
                  claimedInviteId={person.claimedInvite?.invite.id}
                />
              )}
            </div>
          );
        })}
        {orgAuthorization &&
          auth &&
          binnedInvites.pending.map((i) => {
            return (
              <div key={i.invite.id} className="flex items-center">
                <Avatar>
                  <AvatarFallback>{i.invite.email.charAt(0)}</AvatarFallback>
                </Avatar>

                <p className="ml-4 text-sm font-medium leading-none">
                  {i.invite.email}
                </p>
                <div className="ml-auto text-sm text-muted-foreground">
                  Pending
                </div>
                <Info
                  className="ml-2"
                  user={auth.personalOrg}
                  userMembership={orgAuthorization}
                  org={org}
                  inviter={i.inviter}
                  invite={i.invite}
                />
                <InviteActions
                  className="ml-2"
                  invite={i.invite}
                  inviter={i.inviter}
                  user={auth.personalOrg}
                  membership={orgAuthorization}
                />
              </div>
            );
          })}
        {orgAuthorization && <NewInvite org={org} />}
      </div>
    </main>
  );
}
