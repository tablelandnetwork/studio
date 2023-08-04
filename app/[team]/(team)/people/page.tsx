import AddressDisplay from "@/components/address-display";
import NewInvite from "@/components/new-invite";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import db from "@/db/api";
import Session from "@/lib/session";
import TimeAgo from "javascript-time-ago";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Info from "./_components/info";
import InviteActions from "./_components/invite-actions";
import UserActions from "./_components/user-actions";

const timeAgo = new TimeAgo("en-US");

export default async function People({ params }: { params: { team: string } }) {
  const session = await Session.fromCookies(cookies());
  if (!session.auth) {
    notFound();
  }

  const team = await db.teams.teamBySlug(params.team);
  if (!team) {
    notFound();
  }

  const membership = await db.teams.isAuthorizedForTeam(
    session.auth.personalTeam.id,
    team.id
  );

  if (!membership) {
    notFound();
  }

  const people = await db.teams.userTeamsForTeamId(team.id);
  const invites = await db.invites.invitesForTeam(team.id);

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
    { pending: [], claimed: new Map<string, (typeof invites)[number]>() }
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
                team={team}
                inviter={person.claimedInvite?.inviter}
                invite={person.claimedInvite?.invite}
                membership={person.membership}
              />
              <UserActions
                className="ml-2"
                team={team}
                user={session.auth?.personalTeam}
                userMembership={membership}
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
                team={team}
                inviter={i.inviter}
                invite={i.invite}
              />
              <InviteActions
                className="ml-2"
                invite={i.invite}
                inviter={i.inviter}
                user={session.auth.personalTeam}
                membership={membership}
              />
            </div>
          );
        })}
        <NewInvite team={team} />
      </div>
    </div>
  );
}
