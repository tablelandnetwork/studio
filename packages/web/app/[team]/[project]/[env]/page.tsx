import { AlertOctagon, HelpCircle, Rocket } from "lucide-react";
import Link from "next/link";
import { projectBySlug, teamBySlug } from "@/lib/api-helpers";

export default async function Deployments({
  params,
}: {
  params: { team: string; project: string; env: string };
}) {
  const team = await teamBySlug(params.team);
  const project = await projectBySlug(params.project, team.id);

  return (
    <div className="flex flex-1">
      <main className="m-auto my-16 flex max-w-xl flex-1 flex-col justify-center space-y-4">
        <div className="flex items-center space-x-4">
          <Rocket className="flex-shrink-0" />
          <h1 className="text-2xl font-medium">
            Your Project&apos;s definition deployments will appear here.
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <HelpCircle className="flex-shrink-0" />
          <p className="text-muted-foreground">
            Tables are definitions from your Project, created as tables on the
            Tableland network. This screen will allow you to view all your
            Project&apos;s tables, and deploy new ones.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <AlertOctagon className="flex-shrink-0" />
          <p className="text-muted-foreground">
            Before anything useful can be displayed here, you&apos;ll need to
            create some definitions first. Head over to the{" "}
            <Link href={`/${team.slug}/${project.slug}`}>definitions</Link> tab
            to do that.
          </p>
        </div>
      </main>
    </div>
  );
}
