import AddressDisplay from "@/components/address-display";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/trpc/server-invoker";
import { Session } from "@tableland/studio-api";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import Info from "./_components/info";
import InviteActions from "./_components/invite-actions";
import NewInvite from "./_components/new-invite";
import UserActions from "./_components/user-actions";

export default async function People({ params }: { params: { team: string } }) {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    notFound();
  }

  const team = await cache(api.teams.teamBySlug.query)({ slug: params.team });
  const people = await cache(api.teams.usersForTeam.query)({
    teamId: team.id,
  });
  const { invites, teamAuthorization } = await cache(
    api.invites.invitesForTeam.query,
  )({
    teamId: team.id,
  });

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
    <div className="mx-auto max-w-2xl p-4">
      <div className="flex flex-col space-y-6">
        {peopleAugmented.map((person) => {
          if (!session.auth) {
            return null;
          }
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
                  {person.personalTeam.id === session.auth?.personalTeam.id &&
                    " (You)"}
                </p>
                <AddressDisplay
                  address={person.address}
                  copy={true}
                  numCharacters={7}
                />
              </div>
              <div className="ml-auto text-sm text-muted-foreground">
                {person.membership.isOwner ? "Admin" : "Member"}
              </div>
              <Info
                className="ml-2"
                user={session.auth.personalTeam}
                team={team}
                inviter={person.claimedInvite?.inviter}
                invite={person.claimedInvite?.invite}
                membership={person.membership}
              />
              <UserActions
                className="ml-2"
                team={team}
                user={session.auth?.personalTeam}
                userMembership={teamAuthorization}
                member={person.personalTeam}
                memberMembership={person.membership}
                claimedInviteId={person.claimedInvite?.invite.id}
              />
            </div>
          );
        })}
        {binnedInvites.pending.map((i) => {
          if (!session.auth) {
            return null;
          }
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
                user={session.auth.personalTeam}
                team={team}
                inviter={i.inviter}
                invite={i.invite}
              />
              <InviteActions
                className="ml-2"
                invite={i.invite}
                inviter={i.inviter}
                user={session.auth.personalTeam}
                membership={teamAuthorization}
              />
            </div>
          );
        })}
        <NewInvite team={team} />
      </div>
    </div>
  );
}
