import { cache } from "react";
import { notFound } from "next/navigation";
import { OctagonAlert } from "lucide-react";
import DeleteButton from "./_components/delete-button";
import EditOrg from "./_components/edit-org";
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
import { orgBySlug } from "@/lib/api-helpers";

export default async function OrgSettings({
  params,
}: {
  params: { org: string };
}) {
  const org = await orgBySlug(params.org);
  const authorization = await cache(api.orgs.isAuthorized)({
    orgId: org.id,
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
            You need to be an admin to access org settings. An existing admin
            can make this happen.
          </AlertDescription>
        </Alert>
      )}
      <Card className={cn(!isAdmin && "opacity-50")}>
        <CardHeader>
          <CardTitle>Org info</CardTitle>
          <CardDescription>
            Update general information about the {org.name} org.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditOrg key={org.updatedAt} org={org} disabled={!isAdmin} />
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
              {org.personal
                ? `You can delete your personal org, ${org.name}, if you choose. This effectively deletes your Studio account:`
                : `You can delete the ${org.name} org if you choose:`}
            </p>
            <DeleteButton org={org} disabled={!isAdmin} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
