import AddressDisplay from "@/components/address-display";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/server-http";
import { cache } from "react";
import Info from "./_components/info";
import InviteActions from "./_components/invite-actions";
import NewInvite from "./_components/new-invite";
import UserActions from "./_components/user-actions";

export default async function People({ params }: { params: { team: string } }) {
  const auth = await cache(api.auth.authenticated.query)();

  const team = await cache(api.teams.teamBySlug.query)({ slug: params.team });
  const people = await cache(api.teams.usersForTeam.query)({
    teamId: team.id,
  });

  let invites: Awaited<
    ReturnType<typeof api.invites.invitesForTeam.query>
  >["invites"] = [];
  let teamAuthorization:
    | Awaited<
        ReturnType<typeof api.invites.invitesForTeam.query>
      >["teamAuthorization"]
    | undefined;
  try {
    const { invites: invitesRes, teamAuthorization: teamAuthorizationRes } =
      await cache(api.invites.invitesForTeam.query)({
        teamId: team.id,
      });
    invites = invitesRes;
    teamAuthorization = teamAuthorizationRes;
  } catch {}

  const binnedInvites = invites.reduce<{
    pending: (typeof invites)[number][];
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
    if (binnedInvites.claimed.has(person.personalTeam.id)) {
      return {
        ...person,
        claimedInvite: binnedInvites.claimed.get(person.personalTeam.id),
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
            <div key={person.personalTeam.id} className="flex items-center">
              <Avatar className="-z-10">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${person.personalTeam.slug}.png`}
                  alt={person.personalTeam.name}
                />
                <AvatarFallback>
                  {person.personalTeam.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <p className="text-sm font-medium leading-none">
                  {person.personalTeam.name}
                  {person.personalTeam.id === auth?.personalTeam.id && " (You)"}
                </p>
                <AddressDisplay
                  address={person.address}
                  copy={true}
                  numCharacters={7}
                />
              </div>
              {teamAuthorization && (
                <div className="ml-auto text-sm text-muted-foreground">
                  {person.membership.isOwner ? "Admin" : "Member"}
                </div>
              )}
              <Info
                className={cn("ml-2", !teamAuthorization && "ml-auto")}
                user={auth?.personalTeam}
                userMembership={teamAuthorization}
                team={team}
                inviter={person.claimedInvite?.inviter}
                invite={person.claimedInvite?.invite}
                membership={person.membership}
              />
              {auth && teamAuthorization && (
                <UserActions
                  className="ml-2"
                  team={team}
                  user={auth.personalTeam}
                  userMembership={teamAuthorization}
                  member={person.personalTeam}
                  memberMembership={person.membership}
                  claimedInviteId={person.claimedInvite?.invite.id}
                />
              )}
            </div>
          );
        })}
        {teamAuthorization &&
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
                  user={auth.personalTeam}
                  userMembership={teamAuthorization}
                  team={team}
                  inviter={i.inviter}
                  invite={i.invite}
                />
                <InviteActions
                  className="ml-2"
                  invite={i.invite}
                  inviter={i.inviter}
                  user={auth.personalTeam}
                  membership={teamAuthorization!}
                />
              </div>
            );
          })}
        {teamAuthorization && <NewInvite team={team} />}
      </div>
    </main>
  );
}
