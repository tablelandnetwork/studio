import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import Header from "@/components/header";
import Landing from "@/components/landing";
import { Auth, withSessionSsr } from "@/lib/withSession";

type Props = {
  auth: Auth | null;
};

const getProps: GetServerSideProps<Props> = async ({ req, query }) => {
  return { props: { auth: req.session.auth || null } };
};

export const getServerSideProps = withSessionSsr(getProps);

export default function Home({
  auth,
}: InferGetServerSidePropsType<typeof getProps>) {
  return (
    <>
      <Header personalTeam={auth?.personalTeam} />
      <Landing />
    </>
  );
}
