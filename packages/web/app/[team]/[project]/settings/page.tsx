import { notFound } from "next/navigation";
import { cache } from "react";
import { OctagonAlert } from "lucide-react";
import EditProject from "./_components/edit-project";
import DeleteButton from "./_components/delete-button";
import NewEnv from "./_components/new-env";
import Envs from "./_components/envs";
import { projectBySlug, teamBySlug } from "@/lib/api-helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "@/trpc/server";

export default async function ProjectSettings({
  params,
}: {
  params: { team: string; project: string };
}) {
  const team = await teamBySlug(params.team);
  const project = await projectBySlug(params.project, team.id);
  const authorization = await cache(api.teams.isAuthorized)({
    teamId: team.id,
  });
  const envs = await cache(api.environments.projectEnvironments)({
    projectId: project.id,
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
            You need to be an admin to access project settings. An existing
            admin can make this happen.
          </AlertDescription>
        </Alert>
      )}
      <Card className={cn(!isAdmin && "opacity-50")}>
        <CardHeader>
          <CardTitle>Project info</CardTitle>
          <CardDescription>
            Update general information about the {project.name} project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditProject
            key={project.updatedAt}
            team={team}
            project={project}
            disabled={!isAdmin}
          />
        </CardContent>
      </Card>
      <Card className={cn(!isAdmin && "opacity-50")}>
        <CardHeader>
          <CardTitle>Environments</CardTitle>
          <CardDescription>
            Environments are logical groups of definitions. You could, for
            example, use them to create &quot;staging&quot; and
            &quot;production&quot; groups of definitions. All of your
            project&apos;s definitions are available in each environment, but
            you can deploy those definitions to Tableland separately per
            environment.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-y-4">
          <Envs project={project} envs={envs} disabled={!isAdmin} />
          <NewEnv project={project} disabled={!isAdmin} />
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
              You can delete the {project.name} project if you choose:
            </p>
            <DeleteButton team={team} project={project} disabled={!isAdmin} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
