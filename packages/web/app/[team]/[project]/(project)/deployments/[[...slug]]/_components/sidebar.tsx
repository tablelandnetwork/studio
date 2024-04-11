import { type schema } from "@tableland/studio-store";
import { Table2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  environments: schema.Environment[];
  selectedEnvironment?: schema.Environment;
  defs: schema.Def[];
  selectedDef?: schema.Def;
  deploymentsMap: Map<string, Map<string, schema.Deployment>>;
  teamSlug: string;
  projectSlug: string;
  isAuthorized: boolean;
}

export function Sidebar({
  className,
  environments,
  selectedEnvironment,
  defs,
  selectedDef,
  deploymentsMap,
  teamSlug,
  projectSlug,
  isAuthorized,
}: SidebarProps) {
  return (
    <div className={cn("space-y-5 pb-4 pl-4 pt-4", className)}>
      <div className="flex flex-col space-y-1">
        <Link href={`/${teamSlug}/${projectSlug}/deployments`}>
          <Button
            variant={selectedDef ? "ghost" : "secondary"}
            className="w-full justify-start"
          >
            Overview
          </Button>
        </Link>
      </div>
      {environments.map((environment) => (
        <div key={environment.id} className="flex flex-col space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            {/* TODO: Swap these once we unhide environments */}
            Tables
            {/* {environment.name} */}
          </h2>
          {defs.map((def) => {
            const deployment = deploymentsMap.get(environment.id)?.get(def.id);
            const button = (
              <Button
                key={def.id}
                variant={
                  environment.id === selectedEnvironment?.id &&
                  def.id === selectedDef?.id
                    ? "secondary"
                    : "ghost"
                }
                className="w-full justify-start"
                disabled={!isAuthorized && !deployment}
              >
                <Table2
                  className={cn(
                    "mr-2",
                    !deployment && "text-red-400 opacity-40",
                  )}
                />
                <span>{def.name}</span>
              </Button>
            );
            return isAuthorized || deployment ? (
              <Link
                key={def.id}
                href={`/${teamSlug}/${projectSlug}/deployments/${environment.slug}/${def.slug}`}
              >
                {button}
              </Link>
            ) : (
              button
            );
          })}
        </div>
      ))}
    </div>
  );
}
