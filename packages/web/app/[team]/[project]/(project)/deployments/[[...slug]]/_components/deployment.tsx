import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { blockExplorers } from "@/lib/block-explorers";
import { openSeaLinks } from "@/lib/open-sea";
import { Database, helpers } from "@tableland/sdk";
import { schema } from "@tableland/studio-store";
import { ColumnDef } from "@tanstack/react-table";
import TimeAgo from "javascript-time-ago";
import { Blocks, Coins, Hash, Rocket, Table2 } from "lucide-react";
import Link from "next/link";
import { DataTable } from "./data-table";

const timeAgo = new TimeAgo("en-US");

export default async function Deployment({
  environment,
  table,
  deployment,
}: {
  environment: schema.Environment;
  table: schema.Table;
  deployment: schema.Deployment;
}) {
  const chainInfo = helpers.getChainInfo(deployment.chainId);
  const blockExplorer = blockExplorers.get(deployment.chainId);
  const openSeaLink = openSeaLinks.get(deployment.chainId);

  const tbl = new Database({ baseUrl: helpers.getBaseUrl(deployment.chainId) });
  const data = await tbl.exec(`SELECT * FROM ${deployment.tableName};`);
  const columns: ColumnDef<unknown>[] = data.results.length
    ? Object.keys(data.results[0] as object).map((col) => ({
        accessorKey: col,
        header: col,
      }))
    : [];

  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-medium">{table.name}</h1>
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
              {timeAgo.format(new Date(deployment.createdAt))}
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
            <div className="text-2xl font-semibold">{deployment.tableName}</div>
            <Link
              className="text-xs text-muted-foreground"
              href={`https://tablescan.io/${deployment.tableName}`}
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
            <div className="text-2xl font-semibold">{deployment.tokenId}</div>
            {openSeaLink && (
              <Link
                target="_blank"
                href={openSeaLink.tokenUrl(deployment.tokenId)}
                className="text-xs text-muted-foreground"
              >
                View on OpenSea
              </Link>
            )}
          </CardContent>
        </Card>
        {deployment.txnHash && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Transaction Hash
              </CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {deployment.txnHash.slice(0, 5)}...
                {deployment.txnHash.slice(-5)}
              </div>
              {blockExplorer && (
                <Link
                  target="_blank"
                  href={blockExplorer.txUrl(deployment.txnHash)}
                  className="text-xs text-muted-foreground"
                >
                  View on {blockExplorer.explorer}
                </Link>
              )}
            </CardContent>
          </Card>
        )}
        {deployment.blockNumber && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Block Number
              </CardTitle>
              <Blocks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {deployment.blockNumber}
              </div>
              {blockExplorer && (
                <Link
                  target="_blank"
                  href={blockExplorer.blockUrl(deployment.blockNumber)}
                  className="text-xs text-muted-foreground"
                >
                  View on {blockExplorer.explorer}
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <DataTable columns={columns} data={data.results} />
    </div>
  );
}
