import { Invites } from "@/components/invites";
import LayoutTeam from "@/components/layout-team";
import { TeamMembers } from "@/components/team-members";
import db from "@/db/api";
import { Team } from "@/db/schema";
import { cn } from "@/lib/utils";
import { Auth, withSessionSsr } from "@/lib/withSession";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { NextPageWithLayout } from "../_app";

type Props = {
  team: Team;
  teams: Team[];
  people: Awaited<ReturnType<typeof db.teams.userTeamsForTeamId>>;
  invites: Awaited<ReturnType<typeof db.invites.invitesForTeam>>;
  auth: Auth;
};

const getProps: GetServerSideProps<Props> = async ({ req, query }) => {
  if (typeof query.team !== "string") {
    return { notFound: true };
  }

  if (!req.session.auth) {
    // For now only allow authenticated users access.
    // TODO: Really should redirect to some 404 not authorized.
    return { notFound: true };
  }

  const team = await db.teams.teamBySlug(query.team);
  // TODO: Figure out how drizzle handles not found even though the return type isn't optional.
  if (!team) {
    return { notFound: true };
  }

  const teams = await db.teams.teamsByMemberTeamId(
    req.session.auth.user.teamId
  );

  if (
    !db.teams.isAuthorizedForTeam(req.session.auth.personalTeam.id, team.id)
  ) {
    return { notFound: true };
  }

  const people = await db.teams.userTeamsForTeamId(team.id);
  const invites = await db.invites.invitesForTeam(team.id);

  return {
    props: { team, teams: teams, people, invites, auth: req.session.auth },
  };
};

export const getServerSideProps = withSessionSsr(getProps);

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

const People: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getProps>
> = ({
  team,
  people,
  invites,
  auth,
}: InferGetServerSidePropsType<typeof getProps>) => {
  return (
    <div className="grid items-start justify-center gap-6 self-center rounded-lg p-8 md:grid-cols-2">
      <div className="col-span-2 grid items-start gap-6 lg:col-span-1">
        <Container>
          <TeamMembers people={people} personalTeam={auth.personalTeam} />
        </Container>
      </div>
      <div className="col-span-2 grid items-start gap-6 lg:col-span-1">
        <Container>
          <Invites
            invites={invites}
            personalTeam={auth.personalTeam}
            team={team}
          />
        </Container>
      </div>
    </div>
  );
};

People.getLayout = function getLayout(page, { team, auth, teams }) {
  return (
    <LayoutTeam
      auth={auth}
      personalTeam={auth.personalTeam}
      team={team}
      teams={teams}
    >
      {page}
    </LayoutTeam>
  );
};

export default People;
