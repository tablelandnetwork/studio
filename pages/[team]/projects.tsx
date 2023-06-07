import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import React from "react";

import LayoutTeam from "@/components/layout-team";
import NewProjectDialog from "@/components/new-project-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import db from "@/db/api";
import { Project, Team } from "@/db/schema";
import { Auth, withSessionSsr } from "@/lib/withSession";
import { NextPageWithLayout } from "../_app";

type Props = {
  teams: Team[];
  team: Team;
  projects: Project[];
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

  const projects = await db.projects.projectsByTeamId(team.id);

  const userTeams = await db.teams.teamsByMemberTeamId(
    req.session.auth.user.teamId
  );

  return {
    props: { teams: userTeams, team, projects, auth: req.session.auth },
  };
};

export const getServerSideProps = withSessionSsr(getProps);

const Projects: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getProps>
> = ({
  teams: userTeams,
  team,
  projects,
}: InferGetServerSidePropsType<typeof getProps>) => {
  const [showNewProjectDialog, setShowNewProjectDialog] = React.useState(false);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col space-y-4 p-4">
      {projects.map((project) => (
        <Link key={project.id} href={`/${team.slug}/${project.slug}`}>
          <Card>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
        </Link>
      ))}
      <NewProjectDialog
        team={team}
        open={showNewProjectDialog}
        onOpenChange={setShowNewProjectDialog}
      >
        <Button className="w-28" onClick={() => setShowNewProjectDialog(true)}>
          New project
        </Button>
      </NewProjectDialog>
    </div>
  );
};

Projects.getLayout = function (
  page: React.ReactElement,
  { auth, team, teams }
) {
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

export default Projects;
