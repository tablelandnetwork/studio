import InviteHandler from "@/components/invite-handler";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { store } from "@/lib/store";
import { Session } from "@tableland/studio-api";
import { unsealData } from "iron-session";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Invite({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await Session.fromCookies(cookies());

  if (typeof searchParams.seal !== "string") {
    notFound();
  }
  const { inviteId } = await unsealData(searchParams.seal, {
    password: process.env.DATA_SEAL_PASS as string,
  });
  const invite = await store.invites.inviteById(inviteId as string);
  if (!invite) {
    notFound();
  }
  // TODO: Return not found if invite is expired
  if (invite.claimedByTeamId || invite.claimedAt) {
    notFound();
  }
  const targetTeam = await store.teams.teamById(invite.teamId);
  const inviterTeam = await store.teams.teamById(invite.inviterTeamId);

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
              You need to sign in to accept your invitation or you can choose to
              ignore it now.
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
