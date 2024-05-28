import { Database, type Schema, helpers } from "@tableland/sdk";
import { type schema } from "@tableland/studio-store";
import { type ColumnDef } from "@tanstack/react-table";
import { Blocks, Coins, Hash, Rocket, Table2, Workflow } from "lucide-react";
import Link from "next/link";
import { DataTable } from "./data-table";
import {
  MetricCard,
  MetricCardContent,
  MetricCardFooter,
  MetricCardHeader,
  MetricCardTitle,
} from "./metric-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import SQLLogs from "./sql-logs";
import HashDisplay from "./hash-display";
import { CardContent } from "./ui/card";
import ProjectsReferencingTable from "./projects-referencing-table";
import { blockExplorers } from "@/lib/block-explorers";
import { openSeaLinks } from "@/lib/open-sea";
import { chainsMap } from "@/lib/chains-map";
import { objectToTableData } from "@/lib/utils";
import { TimeSince } from "@/components/time";
import { api } from "@/trpc/server";
import DefDetails from "@/components/def-details";

interface Props {
  tableName: string;
  chainId: number;
  tableId: string;
  createdAt: Date;
  schema: Schema;
  environment?: schema.Environment;
  defData?: DefData;
  deploymentData?: DeploymentData;
}

interface DefData {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface DeploymentData {
  tableId: string;
  environmentId: string;
  blockNumber: number | null;
  txnHash: string | null;
}

export default async function Table({
  tableName,
  chainId,
  tableId,
  createdAt,
  schema,
  environment,
  defData,
  deploymentData,
}: Props) {
  const chain = chainsMap.get(chainId);
  const blockExplorer = blockExplorers.get(chainId);
  const openSeaLink = openSeaLinks.get(chainId);

  const baseUrl = helpers.getBaseUrl(chainId);
  const tbl = new Database({ baseUrl });

  const data = await tbl.prepare(`SELECT * FROM ${tableName};`).all();
  const formattedData = objectToTableData(data.results);
  const columns: Array<ColumnDef<unknown>> = data.results.length
    ? Object.keys(data.results[0] as object).map((col) => ({
        accessorKey: col,
        header: col,
      }))
    : [];
  const deploymentReferences = (
    await api.deployments.deploymentReferences({ chainId, tableId })
  ).filter((p) => p.environment.id !== environment?.id);

  return (
    <div className="flex-1 space-y-4">
      <div className="grid grid-flow-row grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <MetricCard>
          <MetricCardHeader className="flex flex-row items-center gap-2 space-y-0">
            <Rocket className="h-4 w-4 text-muted-foreground" />
            <MetricCardTitle>Deployed to</MetricCardTitle>
          </MetricCardHeader>
          <MetricCardContent>{chain?.name}</MetricCardContent>
          <MetricCardFooter>
            <TimeSince time={createdAt} />
          </MetricCardFooter>
        </MetricCard>
        <MetricCard>
          <MetricCardHeader
            className="flex flex-row items-center gap-2 space-y-0"
            copyValue={tableName}
            valueDesc="Table name"
            tooltipText="Click to copy table name"
          >
            <Table2 className="h-4 w-4 text-muted-foreground" />
            <MetricCardTitle>Tableland Table</MetricCardTitle>
          </MetricCardHeader>
          <MetricCardContent tooltipText={tableName}>
            {tableName}
          </MetricCardContent>
          <MetricCardFooter>
            <Link href={`https://tablescan.io/${tableName}`}>
              View on Tablescan
            </Link>
          </MetricCardFooter>
        </MetricCard>
        <MetricCard>
          <MetricCardHeader className="flex flex-row items-center gap-2 space-y-0">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <MetricCardTitle>Token ID</MetricCardTitle>
          </MetricCardHeader>
          <MetricCardContent>{tableId}</MetricCardContent>
          {openSeaLink && (
            <MetricCardFooter>
              <Link target="_blank" href={openSeaLink.tokenUrl(tableId)}>
                View on OpenSea
              </Link>
            </MetricCardFooter>
          )}
        </MetricCard>
        {deploymentData?.txnHash && (
          <MetricCard>
            <MetricCardHeader
              className="flex flex-row items-center gap-2 space-y-0"
              copyValue={deploymentData.txnHash}
              valueDesc="Txn hash"
              tooltipText="Click to copy txn hash"
            >
              <Hash className="h-4 w-4 text-muted-foreground" />
              <MetricCardTitle>Transaction Hash</MetricCardTitle>
            </MetricCardHeader>
            <MetricCardContent>
              <HashDisplay
                hash={deploymentData.txnHash}
                className="text-3xl text-foreground"
              />
            </MetricCardContent>
            {blockExplorer && (
              <MetricCardFooter>
                <Link
                  target="_blank"
                  href={blockExplorer.txUrl(deploymentData.txnHash)}
                >
                  View on {blockExplorer.explorer}
                </Link>
              </MetricCardFooter>
            )}
          </MetricCard>
        )}
        {deploymentData?.blockNumber && (
          <MetricCard>
            <MetricCardHeader className="flex flex-row items-center gap-2 space-y-0">
              <Blocks className="h-4 w-4 text-muted-foreground" />
              <MetricCardTitle>Block Number</MetricCardTitle>
            </MetricCardHeader>
            <MetricCardContent>{deploymentData.blockNumber}</MetricCardContent>
            {blockExplorer && (
              <MetricCardFooter>
                <Link
                  target="_blank"
                  href={blockExplorer.blockUrl(deploymentData.blockNumber)}
                >
                  View on {blockExplorer.explorer}
                </Link>
              </MetricCardFooter>
            )}
          </MetricCard>
        )}
        {deploymentReferences.length > 0 && (
          <MetricCard>
            <MetricCardHeader className="flex flex-row items-center gap-2 space-y-0">
              <Workflow className="h-4 w-4 text-muted-foreground" />
              <MetricCardTitle>
                Studio projects using this table
              </MetricCardTitle>
            </MetricCardHeader>
            <CardContent>
              <ProjectsReferencingTable
                references={deploymentReferences}
                className="h-[80px]"
              />
            </CardContent>
          </MetricCard>
        )}
      </div>
      <Tabs defaultValue="data" className="py-4">
        <TabsList>
          <TabsTrigger value="data">Table Data</TabsTrigger>
          <TabsTrigger value="logs">SQL Logs</TabsTrigger>
          <TabsTrigger value="definition">Definition</TabsTrigger>
        </TabsList>
        <TabsContent value="data">
          <DataTable columns={columns} data={formattedData} />
        </TabsContent>
        <TabsContent value="logs">
          <SQLLogs tables={[{ chainId, tableId }]} />
        </TabsContent>
        <TabsContent value="definition" className="space-y-4">
          <DefDetails name={defData?.name ?? tableName} schema={schema} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
