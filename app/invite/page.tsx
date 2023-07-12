import LayoutMain from "@/components/layout-main";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import db from "@/db/api";
import { Team, TeamInvite } from "@/db/schema";
import { Auth, withSessionSsr } from "@/lib/withSession";
import { trpc } from "@/utils/trpc";
import { unsealData } from "iron-session";
import { Loader2 } from "lucide-react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { NextPageWithLayout } from "../../xpages/_app";

type Props = {
  auth: Auth | null;
  invite: TeamInvite;
  team: Team;
  inviterTeam: Team;
  seal: string;
};

const getProps: GetServerSideProps<Props> = async ({ req, query }) => {
  if (typeof query.seal !== "string") {
    return { notFound: true };
  }
  const { inviteId } = await unsealData(query.seal, {
    password: process.env.DATA_SEAL_PASS as string,
  });
  const invite = await db.invites.inviteById(inviteId as string);
  if (!invite) {
    return { notFound: true };
  }
  // TODO: Return not found if invite is claimed or expired
  const team = await db.teams.teamById(invite.teamId);
  const inviterTeam = await db.teams.teamById(invite.inviterTeamId);
  return {
    props: {
      auth: req.session.auth || null,
      invite,
      team,
      inviterTeam,
      seal: query.seal,
    },
  };
};

export const getServerSideProps = withSessionSsr(getProps);

const Invite: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getProps>
> = ({
  auth,
  invite,
  team,
  inviterTeam,
  seal,
}: InferGetServerSidePropsType<typeof getProps>) => {
  const Login = dynamic(
    () => import("@/components/login").then((res) => res.default),
    { ssr: false }
  );

  const accpectInvite = trpc.teams.acceptInvite.useMutation();
  const ignoreInvite = trpc.teams.ignoreInvite.useMutation();

  const router = useRouter();

  const handleAccept = () => {
    accpectInvite.mutate({ seal });
  };

  const handleIgnore = () => {
    ignoreInvite.mutate({ seal });
  };

  useEffect(() => {
    if (accpectInvite.isSuccess) {
      router.push(`/${team.slug}/projects`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accpectInvite.isSuccess]);

  useEffect(() => {
    if (ignoreInvite.isSuccess) {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ignoreInvite.isSuccess]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Tableland Studio Invite</CardTitle>
          <CardDescription>
            User{" "}
            <span className="font-semibold text-black">{inviterTeam.name}</span>{" "}
            invited you to join the team{" "}
            <span className="font-semibold text-black">{team.name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!auth && (
            <p className="text-center">
              You need to sign in to accept your invitation or you can choose to
              ignore it now.
            </p>
          )}
          {auth && (
            <p className="text-center">
              You are signed in as{" "}
              <span className="font-semibold text-black">
                {auth.personalTeam.name}
              </span>{" "}
              and you can accept or ignore your invitation now.
            </p>
          )}
          {accpectInvite.isError && (
            <p>Error accepting invite: {accpectInvite.error.message}</p>
          )}
          {ignoreInvite.isError && (
            <p>Error ignoring invite: {ignoreInvite.error.message}</p>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex flex-1 items-center justify-center space-x-3">
            <Button
              variant={"outline"}
              onClick={handleIgnore}
              disabled={accpectInvite.isLoading || ignoreInvite.isLoading}
            >
              {ignoreInvite.isLoading && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              )}
              Ignore
            </Button>
            {!auth && (
              <Login
                successRouterCallback={(router) =>
                  router.replace(router.asPath)
                }
              />
            )}
            {auth && (
              <Button
                onClick={handleAccept}
                disabled={accpectInvite.isLoading || ignoreInvite.isLoading}
              >
                {accpectInvite.isLoading && (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                )}
                Accept
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

Invite.getLayout = function (page: React.ReactElement, { auth }) {
  return (
    <LayoutMain
      auth={auth}
      personalTeam={auth?.personalTeam}
      loginSuccessRouterCallback={(router) => router.replace(router.asPath)}
    >
      {page}
    </LayoutMain>
  );
};

export default Invite;
