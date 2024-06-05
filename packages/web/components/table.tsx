import { type schema } from "@tableland/studio-store";
import {
  Blocks,
  Coins,
  Hash,
  AlertCircle,
  Rocket,
  Table2,
  Workflow,
} from "lucide-react";
import { Validator, type Schema, helpers } from "@tableland/sdk";
import Link from "next/link";
import { type RouterOutputs } from "@tableland/studio-api";
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
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { blockExplorers } from "@/lib/block-explorers";
import { openSeaLinks } from "@/lib/open-sea";
import { chainsMap } from "@/lib/chains-map";
import { TimeSince } from "@/components/time";
import { api } from "@/trpc/server";
import DefDetails from "@/components/def-details";
import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  tableName: string;
  chainId: number;
  tableId: string;
  createdAt: Date;
  schema: Schema;
  environment?: schema.Environment;
  defData?: DefData;
  deploymentData?: DeploymentData;
  isAuthorized?: RouterOutputs["teams"]["isAuthorized"];
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
  isAuthorized,
}: Props) {
  const chain = chainsMap.get(chainId);
  const invalidChain = !chain;

  const blockExplorer = blockExplorers.get(chainId);
  const openSeaLink = openSeaLinks.get(chainId);

  const baseUrl = invalidChain ? undefined : helpers.getBaseUrl(chainId);
  const validator = invalidChain ? null : new Validator({ baseUrl });

  const table = validator
    ? await validator.getTableById({ chainId, tableId })
    : null;
  const columns = (table?.schema?.columns ?? []).map(function (col) {
    if (!col.constraints) col.constraints = [];
    if (col.constraints.length === 0) col.constraints.push("none");

    return col;
  });

  const deploymentReferences = invalidChain
    ? []
    : (await api.deployments.deploymentReferences({ chainId, tableId })).filter(
        (p) => p.environment.id !== environment?.id,
      );

  return (
    <div className="flex-1 space-y-4">
      <div className="grid grid-flow-row grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {invalidChain && (
          <Alert className="col-span-full">
            <AlertCircle className="size-5 stroke-destructive" />
            <AlertTitle className="text-destructive">
              Error loading table data
            </AlertTitle>
            <AlertDescription>
              <p>cannot use unsupported chain</p>
              <p>
                You should undeploy this table and redeploy it to a supported
                chain.
              </p>
            </AlertDescription>
          </Alert>
        )}
        {chain && (
          <MetricCard>
            <MetricCardHeader className="flex flex-row items-center gap-2 space-y-0">
              <Rocket className="h-4 w-4 text-muted-foreground" />
              <MetricCardTitle>Deployed to</MetricCardTitle>
            </MetricCardHeader>
            <MetricCardContent>{chain.name}</MetricCardContent>
            <MetricCardFooter>
              <TimeSince time={createdAt} />
            </MetricCardFooter>
          </MetricCard>
        )}
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
          <TabsTrigger value="definition">Definition</TabsTrigger>
          <TabsTrigger value="logs">SQL Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="data">
          {!invalidChain ? (
            <DataTable
              columns={columns}
              chainId={chainId}
              tableId={tableId}
              tableName={tableName}
            />
          ) : (
            <div>
              <div className="mt-4 rounded-md border">
                <UiTable>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    <TableRow>
                      <TableCell className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </UiTable>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="logs">
          {!invalidChain && <SQLLogs tables={[{ chainId, tableId }]} />}
        </TabsContent>

        <TabsContent value="definition" className="space-y-4">
          <DefDetails name={defData?.name ?? tableName} schema={schema} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
