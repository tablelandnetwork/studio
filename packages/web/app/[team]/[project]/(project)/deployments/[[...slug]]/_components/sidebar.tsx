import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { schema } from "@tableland/studio-store";
import { CheckCircle2, CircleDashed } from "lucide-react";
import Link from "next/link";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  environments: schema.Environment[];
  selectedEnvironment?: schema.Environment;
  tables: schema.Table[];
  selectedTable?: schema.Table;
  deploymentsMap: Map<string, Map<string, schema.Deployment>>;
  teamSlug: string;
  projectSlug: string;
  isAuthorized: boolean;
}

export function Sidebar({
  className,
  environments,
  selectedEnvironment,
  tables,
  selectedTable,
  deploymentsMap,
  teamSlug,
  projectSlug,
  isAuthorized,
}: SidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="px-3 py-2">
        <div className="flex flex-col space-y-1">
          <Link href={`/${teamSlug}/${projectSlug}/deployments`}>
            <Button
              variant={selectedTable ? "ghost" : "secondary"}
              className="w-full justify-start"
            >
              Overview
            </Button>
          </Link>
        </div>
      </div>
      {environments.map((environment) => (
        <div key={environment.id} className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {/* TODO: Swap these once we unhide environments */}
            Tables
            {/* {environment.name} */}
          </h2>
          <div className="flex flex-col space-y-1">
            {tables.map((table) => {
              const deployment = deploymentsMap
                .get(environment.id)
                ?.get(table.id);
              const button = (
                <Button
                  variant={
                    environment.id === selectedEnvironment?.id &&
                    table.id === selectedTable?.id
                      ? "secondary"
                      : "ghost"
                  }
                  className="w-full"
                  disabled={!isAuthorized && !deployment}
                >
                  <span>{table.name}</span>
                  {deployment ? (
                    <CheckCircle2 className="ml-auto text-green-400" />
                  ) : (
                    <CircleDashed className="ml-auto text-red-400" />
                  )}
                </Button>
              );
              return isAuthorized || deployment ? (
                <Link
                  key={table.id}
                  href={`/${teamSlug}/${projectSlug}/deployments/${environment.name}/${table.name}`}
                >
                  {button}
                </Link>
              ) : (
                button
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
