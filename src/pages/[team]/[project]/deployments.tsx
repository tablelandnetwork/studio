import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import BodyDeployments from "@/components/body-deployments";
import LayoutProject from "@/components/layout-project";
import db from "@/db/api";
import { DeploymentsWithTables } from "@/db/api/deployments";
import { Project, Table, Team } from "@/db/schema";
import { Auth, withSessionSsr } from "@/lib/withSession";
import { NextPageWithLayout } from "../../_app";

type Props = {
  team: Team;
  project: Project;
  tables: Table[];
  auth: Auth;
  deployments: DeploymentsWithTables[];
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

  const projects = await db.projects.projectsByTeamId(team.id);

  const tables = await db.tables.tablesByProjectId(project.id);

  const deployments = await db.deployments.deploymentsByProjectId(project.id);

  return {
    props: {
      team,
      project,
      projects,
      tables,
      auth: req.session.auth,
      deployments,
    },
  };
};

export const getServerSideProps = withSessionSsr(getProps);

const Project: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getProps>
> = ({
  team,
  project,
  tables,
  deployments,
}: InferGetServerSidePropsType<typeof getProps>) => {
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold">Project</h1>
        <p className="text-lg text-gray-600">
          {team.name} / {project.name}
        </p>
        <p>{project.description}</p>
      </div>

      <BodyDeployments
        team={team}
        project={project}
        tables={tables}
        deployments={deployments}
      />
    </>
  );
};

Project.getLayout = function (
  page: React.ReactElement,
  { auth, team, project, projects }
) {
  return (
    <LayoutProject
      team={team}
      auth={auth}
      personalTeam={auth.personalTeam}
      project={project}
      projects={projects}
    >
      {page}
    </LayoutProject>
  );
};

export default Project;
