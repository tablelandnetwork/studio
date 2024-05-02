import { ComponentProps, PropsWithoutRef } from "react";
import TableMenu from "./table-menu";
import { Database, Validator, type Schema, helpers } from "@tableland/sdk";

export default async function TableWrapper({
  chainId,
  tableId,
  displayName,
  children,
  ...props
}: {
  chainId?: number;
  tableId?: string;
  displayName: string;
  children: React.ReactNode;
}) {
  const baseUrl = chainId ? helpers.getBaseUrl(chainId) : undefined;
  const validator = baseUrl ? new Validator({ baseUrl }) : undefined;
  const table =
    chainId && tableId
      ? await validator?.getTableById({ chainId, tableId })
      : undefined;

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-medium">{displayName}</h1>
        <TableMenu
          schemaPreset={table?.schema}
          chainIdPreset={chainId}
          tableIdPreset={tableId}
        />
      </div>
      {children}
    </div>
  );
}
