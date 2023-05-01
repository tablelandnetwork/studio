import { useHydrateAtoms } from "jotai/utils";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import Header from "@/components/header";
import Landing from "@/components/landing";
import { Auth, withSessionSsr } from "@/lib/withSession";
import { authAtom } from "@/store/auth";

type Props = {
  auth: Auth | null;
};

const getProps: GetServerSideProps<Props> = async ({ params, req }) => {
  return { props: { auth: req.session.auth || null } };
};

export const getServerSideProps = withSessionSsr(getProps);

export default function Home({
  auth,
}: InferGetServerSidePropsType<typeof getProps>) {
  // useHydrateAtoms([[authAtom, auth]]);
  return (
    <>
      <Header personalTeam={auth?.personalTeam} />
      <Landing />
    </>
  );
}
