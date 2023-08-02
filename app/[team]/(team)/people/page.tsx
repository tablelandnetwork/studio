import AddressDisplay from "@/components/address-display";
import { Invites } from "@/components/invites";
import { TeamMembers } from "@/components/team-members";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import db from "@/db/api";
import Session from "@/lib/session";
import { cn } from "@/lib/utils";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { CircleEllipsis, InfoIcon } from "lucide-react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-center [&>div]:w-full",
        className
      )}
      {...props}
    />
  );
}

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
      <p>
        people:{" "}
        {peopleAugmented
          .map(
            (p) =>
              `${p.personalTeam.name} ${
                p.claimedInvite ? p.claimedInvite.invite.email : "none"
              }`
          )
          .join(", ")}
      </p>
      <br />
      <p>
        invites: {binnedInvites.pending.map((i) => i.invite.email).join(", ")}
      </p>
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
            <div>
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
            <div className="ml-auto">owner</div>
            <InfoIcon />
            <CircleEllipsis />
          </div>
        ))}
        {binnedInvites.pending.map((i) => (
          <div key={i.invite.id} className="flex items-center">
            <Avatar>
              <AvatarFallback>{i.invite.email.charAt(0)}</AvatarFallback>
            </Avatar>

            <div>
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
            <CircleEllipsis className="ml-auto" />
          </div>
        ))}
        <Button variant="outline" className="self-start">
          New Invite
        </Button>
        <Container>
          <TeamMembers
            people={people}
            personalTeam={session.auth.personalTeam}
          />
        </Container>
      </div>
      <div className="col-span-2 grid items-start gap-6 lg:col-span-1">
        <Container>
          <Invites
            invites={invites}
            personalTeam={session.auth.personalTeam}
            team={team}
          />
        </Container>
      </div>
    </div>
  );
}
