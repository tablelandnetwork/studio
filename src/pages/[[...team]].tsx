import { useAtom } from "jotai";
import { authAtom } from "@/store/auth";
import Landing from "@/components/landing";
import Authed from "@/components/authed";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { teamById, teamByName } from "@/db/api";
import { withSessionSsr } from "@/lib/withSession";
import { Team } from "@/db/schema";

type Props = {
  team?: Team;
};

const getProps: GetServerSideProps<Props> = async ({ params, req }) => {
  const teamName = params?.team;
  console.log(teamName);
  if (typeof teamName === "string") {
    return {
      redirect: {
        destination: `/`,
        permanent: false,
      },
    };
  }
  let team: Team | undefined;
  if (teamName) {
    team = await teamByName(teamName[0]);
    if (!team) {
      return { notFound: true };
    }
  } else if (!!req.session.auth?.personalTeamId) {
    team = await teamById(req.session.auth.personalTeamId);
  }
  return { props: { team } };
};

export const getServerSideProps = withSessionSsr(getProps);

export default function Home({
  team,
}: InferGetServerSidePropsType<typeof getProps>) {
  const [auth] = useAtom(authAtom);

  if (!team) {
    return <Landing />;
  }

  if (auth) {
    return (
      <Authed
        userId={auth.userId}
        personalTeamId={auth.personalTeamId}
        teamId={team.id}
      />
    );
  } else {
    return <Landing />;
  }
}
