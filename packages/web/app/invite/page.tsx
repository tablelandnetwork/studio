import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getSession } from "@tableland/studio-api";
import { api } from "@/trpc/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InviteHandler from "@/components/invite-handler";

export default async function Invite({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (typeof searchParams.seal !== "string") {
    notFound();
  }
  const invite = await cache(api.invites.inviteFromSeal)({
    seal: searchParams.seal,
  });
  // TODO: Return not found if invite is expired
  // TODO: consider removing this lint rule. We want to check for null, undefined, false, and ""
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (invite.claimedByTeamId || invite.claimedAt) {
    notFound();
  }
  const targetTeam = await cache(api.teams.getTeam)({
    teamId: invite.teamId,
  });
  const inviterTeam = await cache(api.teams.getTeam)({
    teamId: invite.inviterTeamId,
  });

  const session = await getSession({ cookies: cookies(), headers: headers() });

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Tableland Studio Invite</CardTitle>
          <CardDescription>
            User{" "}
            <span className="font-semibold text-foreground">
              {inviterTeam.name}
            </span>{" "}
            invited you to join the team{" "}
            <span className="font-semibold text-foreground">
              {targetTeam.name}
            </span>
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
              <span className="font-semibold text-foreground">
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
