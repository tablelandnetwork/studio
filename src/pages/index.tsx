import { useHydrateAtoms } from "jotai/utils";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import Header from "@/components/header";
import Landing from "@/components/landing";
import { Auth, withSessionSsr } from "@/lib/withSession";
import { hasInviteAtom } from "@/store/invite";

type Props = {
  auth: Auth | null;
  hasInvite: boolean;
};

const getProps: GetServerSideProps<Props> = async ({ req, query }) => {
  console.log("query invite:", query.invite);
  let hasInvite = false;
  if (typeof query.invite === "string") {
    req.session.invite = query.invite;
    hasInvite = true;
    await req.session.save();
  }
  return { props: { auth: req.session.auth || null, hasInvite } };
};

export const getServerSideProps = withSessionSsr(getProps);

export default function Home({
  auth,
  hasInvite,
}: InferGetServerSidePropsType<typeof getProps>) {
  useHydrateAtoms([[hasInviteAtom, hasInvite] as const]);
  return (
    <>
      <Header personalTeam={auth?.personalTeam} />
      <Landing />
    </>
  );
}
