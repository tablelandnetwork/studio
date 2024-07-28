"use client";

import { type Auth, type RouterOutputs } from "@tableland/studio-api";
import { type Schema } from "@tableland/studio-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import SQLLogs from "./sql-logs";
import { TableData } from "./table-data";
import ACL from "./acl";
import WalletStatus from "./wallet-status";
import DefDetails from "@/components/def-details";
import { type TablePermissions } from "@/lib/validator-queries";
import { useAccountPermissions } from "@/lib/use-account-permissions";

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
  const { address, accountPermissions } =
    useAccountPermissions(tablePermissions);

  return (
    <Tabs defaultValue="data" className="py-4">
      <div className="flex items-end">
        <TabsList>
          <TabsTrigger value="data">Table Data</TabsTrigger>
          <TabsTrigger value="logs">SQL Logs</TabsTrigger>
          <TabsTrigger value="definition">Schema</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>
        <WalletStatus
          auth={auth}
          owner={owner}
          address={address}
          accountPermissions={accountPermissions}
        />
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
