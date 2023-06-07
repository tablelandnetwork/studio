import Landing from "@/components/landing";
import LayoutMain from "@/components/layout-main";
import { Auth, withSessionSsr } from "@/lib/withSession";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { NextPageWithLayout } from "./_app";

type Props = {
  auth: Auth | null;
};

const getProps: GetServerSideProps<Props> = async ({ req, query }) => {
  return { props: { auth: req.session.auth || null } };
};

export const getServerSideProps = withSessionSsr(getProps);

const Home: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getProps>
> = () => {
  return <Landing />;
};

Home.getLayout = function (page: React.ReactElement, { auth }) {
  return (
    <LayoutMain auth={auth} personalTeam={auth?.personalTeam}>
      {page}
    </LayoutMain>
  );
};

export default Home;
