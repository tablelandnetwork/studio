import { Invites } from "@/components/invites";
import { TeamMembers } from "@/components/team-members";
import db from "@/db/api";
import Session from "@/lib/session";
import { cn } from "@/lib/utils";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

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

  const people = await db.teams.userTeamsForTeamId(team.id);
  const invites = await db.invites.invitesForTeam(team.id);

  return (
    <div className="grid items-start justify-center gap-6 self-center rounded-lg p-8 md:grid-cols-2">
      <div className="col-span-2 grid items-start gap-6 lg:col-span-1">
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
