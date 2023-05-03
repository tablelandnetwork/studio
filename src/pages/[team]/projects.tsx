import { useAtomValue, useSetAtom } from "jotai";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import React from "react";

import HeaderAuthed from "@/components/header-team";
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
import { teamBySlug } from "@/db/api";
import { Team } from "@/db/schema";
import { Auth, withSessionSsr } from "@/lib/withSession";
import { projectsForCurrentTeamAtom } from "@/store/projects";
import { selectedTeamAtom } from "@/store/teams";

type Props = {
  team: Team;
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

  const team = await teamBySlug(query.team);
  // TODO: Figure out how drizzle handles not found even though the return type isn't optional.
  if (!team) {
    return { notFound: true };
  }

  return { props: { team, auth: req.session.auth } };
};

export const getServerSideProps = withSessionSsr(getProps);

export default function Projects({
  team,
  auth,
}: InferGetServerSidePropsType<typeof getProps>) {
  const [showNewProjectDialog, setShowNewProjectDialog] = React.useState(false);

  const projects = useAtomValue(projectsForCurrentTeamAtom);
  const setSelectedTeam = useSetAtom(selectedTeamAtom);

  React.useEffect(() => {
    setSelectedTeam(team);
  }, [setSelectedTeam, team]);

  return (
    <NewProjectDialog
      team={team}
      open={showNewProjectDialog}
      onOpenChange={setShowNewProjectDialog}
    >
      <HeaderAuthed team={team} personalTeam={auth.personalTeam} />
      <div className="mx-auto flex w-full max-w-3xl flex-col space-y-4 p-4">
        {projects?.map((project) => (
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
        <Button className="w-28" onClick={() => setShowNewProjectDialog(true)}>
          New project
        </Button>
      </div>
    </NewProjectDialog>
  );
}
