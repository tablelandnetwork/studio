import { cache } from "react";
import { notFound } from "next/navigation";
import { OctagonAlert } from "lucide-react";
import DeleteButton from "./_components/delete-button";
import EditTeam from "./_components/edit-team";
import { api } from "@/trpc/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function TeamSettings({
  params,
}: {
  params: { team: string };
}) {
  const team = await cache(api.teams.teamBySlug)({ slug: params.team });
  const authorization = await cache(api.teams.isAuthorized)({
    teamId: team.id,
  });

  if (!authorization) {
    notFound();
  }

  const isAdmin = authorization.isOwner;

  return (
    <main className="container max-w-2xl space-y-12 py-12">
      {!isAdmin && (
        <Alert>
          <OctagonAlert className="h-4 w-4" />
          <AlertTitle>Hold on</AlertTitle>
          <AlertDescription>
            You need to be an admin to access team settings. An existing admin
            can make this happen.
          </AlertDescription>
        </Alert>
      )}
      <Card className={cn(!isAdmin && "opacity-50")}>
        <CardHeader>
          <CardTitle>Team info</CardTitle>
          <CardDescription>
            Update general information about the {team.name} team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditTeam team={team} disabled={!isAdmin} />
        </CardContent>
      </Card>
      <Card className={cn(!isAdmin && "opacity-50")}>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Think twice before doing anything here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {team.personal
                ? `You can delete your personal team, ${team.name}, if you choose. This effectively deletes your Studio account:`
                : "You can delete the {team.name} team if you choose:"}
            </p>
            <DeleteButton team={team} disabled={!isAdmin} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
