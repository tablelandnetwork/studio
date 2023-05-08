import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { inviteById, teamById } from "@/db/api";
import { Team, TeamInvite } from "@/db/schema";
import { Auth, withSessionSsr } from "@/lib/withSession";
import { acceptInviteAtom, ignoreInviteAtom } from "@/store/teams";
import { unsealData } from "iron-session";
import { useSetAtom } from "jotai";
import { Loader2 } from "lucide-react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React from "react";

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
  const invite = await inviteById(inviteId as string);
  if (!invite) {
    return { notFound: true };
  }
  // TODO: Return not found if invite is claimed or expired
  const team = await teamById(invite.teamId);
  const inviterTeam = await teamById(invite.inviterTeamId);
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

export default function Invite({
  auth,
  invite,
  team,
  inviterTeam,
  seal,
}: InferGetServerSidePropsType<typeof getProps>) {
  const Login = dynamic(
    () => import("@/components/login").then((res) => res.default),
    { ssr: false }
  );

  const accpectInvite = useSetAtom(acceptInviteAtom);
  const ignoreInvite = useSetAtom(ignoreInviteAtom);
  const [accepting, setAccepting] = React.useState(false);
  const [ignoring, setIgnoring] = React.useState(false);
  const [error, setError] = React.useState("");

  const router = useRouter();

  const handleAccept = async () => {
    try {
      setError("");
      setAccepting(true);
      await accpectInvite([{ seal }]);
      router.push(`/${team.slug}/projects`);
    } catch (err: any) {
      setError("Error accepting invite.");
    } finally {
      setAccepting(false);
    }
  };

  const handleIgnore = async () => {
    try {
      setError("");
      setIgnoring(true);
      await ignoreInvite([{ seal }]);
      router.replace("/");
    } catch (err: any) {
      setError("Error ingoring invite.");
    } finally {
      setIgnoring(false);
    }
  };

  return (
    <>
      <Header
        personalTeam={auth?.personalTeam}
        loginSuccessRouterCallback={(router) => router.replace(router.asPath)}
      />
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Tableland Studio Invite</CardTitle>
            <CardDescription>
              User{" "}
              <span className="font-semibold text-black">
                {inviterTeam.name}
              </span>{" "}
              invited you to join the team{" "}
              <span className="font-semibold text-black">{team.name}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!auth && (
              <p className="text-center">
                You need to sign in to accept your invitation or you can choose
                to ignore it now.
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
            {!!error && <p>{error}</p>}
          </CardContent>
          <CardFooter>
            <div className="flex flex-1 items-center justify-center space-x-3">
              <Button
                variant={"outline"}
                onClick={handleIgnore}
                disabled={accepting || ignoring}
              >
                {ignoring && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
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
                <Button onClick={handleAccept} disabled={accepting || ignoring}>
                  {accepting && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  Accept
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
