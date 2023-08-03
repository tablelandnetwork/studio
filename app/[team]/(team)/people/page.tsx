import AddressDisplay from "@/components/address-display";
import NewInvite from "@/components/new-invite";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import db from "@/db/api";
import Session from "@/lib/session";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { MoreHorizontal } from "lucide-react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Info from "./_components/info";

TimeAgo.addDefaultLocale(en);
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

  if (
    !(await db.teams.isAuthorizedForTeam(session.auth.personalTeam.id, team.id))
  ) {
    notFound();
  }

  // TODO: Update this query to return owner or not.
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
    <div className="mx-auto max-w-3xl p-4">
      <div className="flex flex-col space-y-6">
        {peopleAugmented.map((person) => (
          <div key={person.personalTeam.id} className="flex items-center">
            <Avatar>
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
            <div className="m-auto text-muted-foreground">
              {person.membership.isOwner ? "owner" : "member"}
            </div>
            <Info
              className="ml-auto"
              team={team}
              inviter={person.claimedInvite?.inviter}
              invite={person.claimedInvite?.invite}
              membership={person.membership}
            />
            <MoreHorizontal className="ml-4" />
          </div>
        ))}
        {binnedInvites.pending.map((i) => (
          <div key={i.invite.id} className="flex items-center">
            <Avatar>
              <AvatarFallback>{i.invite.email.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="ml-4">
              <p className="text-sm font-medium leading-none">
                {i.invite.email}
              </p>
              <p className="text-sm text-muted-foreground">
                Invited by{" "}
                <span className="font-medium">
                  {i.inviter.id === session.auth?.personalTeam.id
                    ? "you"
                    : i.inviter.name}
                </span>{" "}
                {timeAgo.format(new Date(i.invite.createdAt))}
              </p>
            </div>
            <MoreHorizontal className="ml-auto" />
          </div>
        ))}
        <NewInvite team={team} />
      </div>
    </div>
  );
}
