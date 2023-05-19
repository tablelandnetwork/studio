import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import BodyProject from "@/components/body-project";
import HeaderProject from "@/components/header-project";
import db from "@/db/api";

import { Project, Table, Team } from "@/db/schema";
import { Auth, withSessionSsr } from "@/lib/withSession";
import { tablelandAtom } from "@/store/db";
import { useAtom } from "jotai";

type Props = {
  team: Team;
  project: Project;
  auth: Auth;
  tables: Table[];
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

  const tables = await db.tables.tablesByProjectId(project.id);

  return { props: { team, project, auth: req.session.auth, tables } };
};

function logDepoyment(deployment: any, res: any) {
  console.log(deployment);
}

export const getServerSideProps = withSessionSsr(getProps);

// TODO: Consolidate component for [project].tsx and [project]\deployments.tsx and [project]\settings.tsx
export default function Project({
  team,
  project,
  auth,
  tables,
}: InferGetServerSidePropsType<typeof getProps>) {
  const [tbl] = useAtom(tablelandAtom);

  async function doDeployment() {
    console.log("Doing deployment");
    if (!tbl) return;
    console.log("No really, donig deployment");
    // Ask user to sign transaction with create statement for each table.
    /// Get all table schemas and IDs
    /// Associate table names on network with table IDs in Studio
    /// Do we need to associate a given table on the network with a given table in Studio?

    // Once deployment is complete, send deployment details to API.
    // API will then create a deploy on our tables.
    // Once that is complete, the loading page will be updated with the deployment details.

    const inserts = tables.map((table) => {
      return tbl.prepare(table.schema);
    });

    const res = await tbl.batch(inserts);
    inserts.forEach((r: any) => console.log(r));
    console.log(res);
  }

  return (
    <>
      <HeaderProject
        team={team}
        personalTeam={auth.personalTeam}
        project={project}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold">Deployments</h1>
        <p className="text-lg text-gray-600">
          {team.name} / {project.name}
        </p>
        <p>{project.description}</p>
      </div>
      <div>
        <button onClick={doDeployment}>Deploy</button>
      </div>
      <BodyProject
        team={team}
        personalTeam={auth.personalTeam}
        project={project}
      />
    </>
  );
}
