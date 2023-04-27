import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { teamById } from "@/db/api";
import { withSessionSsr } from "@/lib/withSession";
import { Team } from "@/db/schema";
import Header from "@/components/header";
import Landing from "@/components/landing";

type Props = {
  personalTeam: Team | null;
};

const getProps: GetServerSideProps<Props> = async ({ params, req }) => {
  const personalTeam = req.session.auth
    ? await teamById(req.session.auth.personalTeam.id)
    : null;

  return { props: { personalTeam } };
};

export const getServerSideProps = withSessionSsr(getProps);

export default function Home({
  personalTeam,
}: InferGetServerSidePropsType<typeof getProps>) {
  const team = personalTeam ? personalTeam : undefined;
  return (
    <>
      <Header personalTeam={team} />
      <Landing />
    </>
  );
}
