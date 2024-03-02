import { Database, type Schema, helpers } from "@tableland/sdk";
import { type schema } from "@tableland/studio-store";
import { type ColumnDef } from "@tanstack/react-table";
import TimeAgo from "javascript-time-ago";
import { Blocks, Coins, Hash, Rocket, Table2 } from "lucide-react";
import Link from "next/link";
import { DataTable } from "../app/[team]/[project]/(project)/deployments/[[...slug]]/_components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import SQLLogs from "./sql-logs";
import { blockExplorers } from "@/lib/block-explorers";
import { openSeaLinks } from "@/lib/open-sea";

const timeAgo = new TimeAgo("en-US");

interface Props {
  displayName: string;
  tableName: string;
  chainId: number;
  tokenId: string;
  createdAt: Date;
  schema: Schema;
  environment?: schema.Environment;
  tableData?: TableData;
  deploymentData?: DeploymentData;
}

interface TableData {
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

export default async function TablelandTable({
  displayName,
  tableName,
  chainId,
  tokenId,
  createdAt,
  environment,
  tableData,
  deploymentData,
}: Props) {
  const chainInfo = helpers.getChainInfo(chainId);
  const blockExplorer = blockExplorers.get(chainId);
  const openSeaLink = openSeaLinks.get(chainId);

  const tbl = new Database({ baseUrl: helpers.getBaseUrl(chainId) });
  const data = await tbl.prepare(`SELECT * FROM ${tableName};`).all();
  const columns: Array<ColumnDef<unknown>> = data.results.length
    ? Object.keys(data.results[0] as object).map((col) => ({
        accessorKey: col,
        header: col,
      }))
    : [];

  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-medium">{displayName}</h1>
        {/* <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Staging" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Environments</SelectLabel>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select> */}
      </div>
      <div className="grid grid-flow-row grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed to</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{chainInfo.chainName}</div>
            <p className="text-xs text-muted-foreground">
              {timeAgo.format(createdAt)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tableland Table
            </CardTitle>
            <Table2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{tableName}</div>
            <Link
              className="text-xs text-muted-foreground"
              href={`https://tablescan.io/${tableName}`}
            >
              View on Tablescan
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token ID</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{tokenId}</div>
            {openSeaLink && (
              <Link
                target="_blank"
                href={openSeaLink.tokenUrl(tokenId)}
                className="text-xs text-muted-foreground"
              >
                View on OpenSea
              </Link>
            )}
          </CardContent>
        </Card>
        {deploymentData?.txnHash && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Transaction Hash
              </CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {deploymentData.txnHash.slice(0, 5)}...
                {deploymentData.txnHash.slice(-5)}
              </div>
              {blockExplorer && (
                <Link
                  target="_blank"
                  href={blockExplorer.txUrl(deploymentData.txnHash)}
                  className="text-xs text-muted-foreground"
                >
                  View on {blockExplorer.explorer}
                </Link>
              )}
            </CardContent>
          </Card>
        )}
        {deploymentData?.blockNumber && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Block Number
              </CardTitle>
              <Blocks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {deploymentData.blockNumber}
              </div>
              {blockExplorer && (
                <Link
                  target="_blank"
                  href={blockExplorer.blockUrl(deploymentData.blockNumber)}
                  className="text-xs text-muted-foreground"
                >
                  View on {blockExplorer.explorer}
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <Tabs defaultValue="logs" className="py-4">
        <TabsList>
          <TabsTrigger value="data">Table Data</TabsTrigger>
          <TabsTrigger value="logs">SQL Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="data">
          <DataTable columns={columns} data={data.results} />
        </TabsContent>
        <TabsContent value="logs">
          <SQLLogs chain={chainId} tableId={tokenId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
