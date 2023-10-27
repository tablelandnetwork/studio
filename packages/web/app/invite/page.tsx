import InviteHandler from "@/components/invite-handler";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/server";
import { Session } from "@tableland/studio-api";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";

export default async function Invite({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  if (typeof searchParams.seal !== "string") {
    notFound();
  }
  const invite = await cache(api.invites.inviteFromSeal.query)({
    seal: searchParams.seal,
  });
  // TODO: Return not found if invite is expired
  if (invite.claimedByTeamId || invite.claimedAt) {
    notFound();
  }
  const targetTeam = await cache(api.teams.teamById.query)({
    teamId: invite.teamId,
  });
  const inviterTeam = await cache(api.teams.teamById.query)({
    teamId: invite.inviterTeamId,
  });

  const session = await Session.fromCookies(cookies());

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Tableland Studio Invite</CardTitle>
          <CardDescription>
            User{" "}
            <span className="font-semibold text-black">{inviterTeam.name}</span>{" "}
            invited you to join the team{" "}
            <span className="font-semibold text-black">{targetTeam.name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!session.auth && (
            <p className="text-center">
              You need to connect your wallet and then sign in to accept your
              invitation or you can choose to ignore it now.
            </p>
          )}
          {session.auth && (
            <p className="text-center">
              You are signed in as{" "}
              <span className="font-semibold text-black">
                {session.auth.personalTeam.name}
              </span>{" "}
              and you can accept or ignore your invitation now.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <InviteHandler seal={searchParams.seal} targetTeam={targetTeam} />
        </CardFooter>
      </Card>
    </div>
  );
}
