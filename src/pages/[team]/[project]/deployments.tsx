import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import BodyProject from "@/components/body-project";
import HeaderProject from "@/components/header-project";
import db from "@/db/api";
import { Project, Team } from "@/db/schema";
import { Auth, withSessionSsr } from "@/lib/withSession";

type Props = {
  team: Team;
  project: Project;
  auth: Auth;
};

const getProps: GetServerSideProps<Props> = async ({ req, query }) => {
  if (typeof query.team !== "string" || typeof query.project !== "string") {
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

  const project = await db.projects.projectByTeamIdAndSlug(
    team.id,
    query.project
  );
  if (!project) {
    return { notFound: true };
  }

  return { props: { team, project, auth: req.session.auth } };
};

export const getServerSideProps = withSessionSsr(getProps);

// TODO: Consolidate component for [project].tsx and [project]\deployments.tsx and [project]\settings.tsx
export default function Project({
  team,
  project,
  auth,
}: InferGetServerSidePropsType<typeof getProps>) {
  return (
    <>
      <HeaderProject
        team={team}
        personalTeam={auth.personalTeam}
        project={project}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold">Project</h1>
        <p className="text-lg text-gray-600">
          {team.name} / {project.name}
        </p>
        <p>{project.description}</p>
        <p>Deployments</p>
      </div>
      <BodyProject
        team={team}
        personalTeam={auth.personalTeam}
        project={project}
      />
    </>
  );
}
