"use client";

import { type Auth, type RouterOutputs } from "@tableland/studio-api";
import { type Schema } from "@tableland/studio-store";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { AlertTriangle, Crown, KeyRound, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import SQLLogs from "./sql-logs";
import { TableData } from "./table-data";
import HashDisplay from "./hash-display";
import ACL from "./acl";
import { cn } from "@/lib/utils";
import DefDetails from "@/components/def-details";
import { type TablePermissions } from "@/lib/validator-queries";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface TableDetailsProps {
  displayName: string;
  tableName: string;
  schema: Schema;
  chainId: number;
  tableId: string;
  data: Array<Record<string, unknown>>;
  tablePermissions: TablePermissions;
  owner: string;
  authorizedStudioUsers: RouterOutputs["users"]["usersForAddresses"];
  auth?: Auth;
}

export default function TableDetails({
  displayName,
  tableName,
  schema,
  chainId,
  tableId,
  data,
  tablePermissions,
  owner,
  authorizedStudioUsers,
  auth,
}: TableDetailsProps) {
  const [addressPostMount, setAddressPostMount] = useState<
    `0x${string}` | undefined
  >();
  const { address } = useAccount();

  useEffect(() => {
    setAddressPostMount(address);
  }, [address]);

  const authorizedStudioUser = useMemo(
    () =>
      addressPostMount
        ? authorizedStudioUsers.get(addressPostMount)
        : undefined,
    [addressPostMount, authorizedStudioUsers],
  );

  const accountPermissions = useMemo(
    () => (addressPostMount ? tablePermissions[addressPostMount] : undefined),
    [addressPostMount, tablePermissions],
  );

  return (
    <Tabs defaultValue="data" className="py-4">
      <div className="flex items-end">
        <TabsList className={cn(!data && "bg-transparent")}>
          <TabsTrigger value="data">Table Data</TabsTrigger>
          <TabsTrigger value="logs">SQL Logs</TabsTrigger>
          <TabsTrigger value="definition">Schema</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>
        {addressPostMount && (
          <div className="ml-auto flex items-center gap-x-4 text-sm text-foreground">
            <span>
              Connected as{" "}
              <div className="inline-block">
                <HashDisplay
                  hash={addressPostMount}
                  copy
                  className="inline-block text-foreground"
                />
              </div>
            </span>
            <div className="flex items-center gap-x-2">
              {authorizedStudioUser && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <User className="size-4 shrink-0 stroke-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Studio user {authorizedStudioUser.team.name}
                      {authorizedStudioUser.user.teamId === auth?.user.teamId
                        ? " (you)"
                        : ""}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {auth && auth.user.address !== addressPostMount && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertTriangle className="size-4 shrink-0 stroke-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      This address is different than the one associated with
                      your Studio account.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {owner === addressPostMount && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Crown className="size-4 shrink-0 stroke-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Table owner</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {accountPermissions && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <KeyRound className="size-4 shrink-0 stroke-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Permissions:
                      <ul className="list-disc px-3">
                        {accountPermissions.privileges.insert && (
                          <li>Insert</li>
                        )}
                        {accountPermissions.privileges.update && (
                          <li>Update</li>
                        )}
                        {accountPermissions.privileges.delete && (
                          <li>Delete</li>
                        )}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}
      </div>
      <TabsContent value="data">
        <TableData
          chainId={chainId}
          tableName={tableName}
          schema={schema}
          initialData={data}
          accountPermissions={accountPermissions}
        />
      </TabsContent>
      <TabsContent value="logs">
        <SQLLogs tables={[{ chainId, tableId }]} />
      </TabsContent>
      <TabsContent value="definition" className="space-y-4">
        <DefDetails name={displayName} schema={schema} />
      </TabsContent>
      <TabsContent value="permissions" className="space-y-4">
        <ACL
          acl={Object.values(tablePermissions)}
          authorizedStudioUsers={authorizedStudioUsers}
          owner={owner}
        />
      </TabsContent>
    </Tabs>
  );
}
