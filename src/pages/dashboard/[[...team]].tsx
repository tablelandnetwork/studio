import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import HeaderAuthed from "@/components/header-authed";
import { teamById, teamBySlug } from "@/db/api";
import { Auth, withSessionSsr } from "@/lib/withSession";
import { Team } from "@/db/schema";

type Props = {
  team: Team;
  personalTeam: Team;
  auth: Auth;
  subPage: string;
};

const subpages = ["projects", "people", "settings"];

const getProps: GetServerSideProps<Props> = async ({ params, req }) => {
  const path = params?.team;
  // Since this is a catch all route, this param should never be just a string.
  if (typeof path === "string" || !path) {
    return {
      redirect: {
        destination: `/`,
        permanent: false,
      },
    };
  }

  if (!req.session.auth) {
    // For now only allow authenticated users access.
    // TODO: Really should redirect to some 404 not authorized.
    return { notFound: true };
  }

  const team = await teamBySlug(path[0]);
  // TODO: Figure out how drizzle handles not found even though the return type isn't optional.
  if (!team) {
    return { notFound: true };
  }
  const subPage = path.length > 1 ? path[1] : "projects";
  if (!subpages.includes(subPage)) {
    return { notFound: true };
  }

  const personalTeam = await teamById(req.session.auth.personalTeam.id);

  return { props: { team, personalTeam, auth: req.session.auth, subPage } };
};

export const getServerSideProps = withSessionSsr(getProps);

export default function Dashboard({
  team,
  personalTeam,
  auth,
  subPage,
}: InferGetServerSidePropsType<typeof getProps>) {
  return (
    <HeaderAuthed
      userId={auth.user.id}
      // personalTeamId={auth.personalTeamId}
      team={team}
      personalTeam={personalTeam}
    />
  );
}
