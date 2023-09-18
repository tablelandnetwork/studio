import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, helpers } from "@tableland/sdk";
import { schema } from "@tableland/studio-store";
import { ColumnDef } from "@tanstack/react-table";
import TimeAgo from "javascript-time-ago";
import { Blocks, Coins, Hash, Rocket, Table2 } from "lucide-react";
import Link from "next/link";
import { DataTable } from "./data-table";

const timeAgo = new TimeAgo("en-US");

const blockExplorers = new Map<
  number,
  {
    explorer: string;
    blockUrl: (block: number) => string;
    txUrl: (hash: string) => string;
  }
>([
  [
    1,
    {
      explorer: "Etherscan",
      blockUrl: (block) => `https://etherscan.io/block/${block}`,
      txUrl: (hash) => `https://etherscan.io/tx/${hash}`,
    },
  ],
  [
    11155111,
    {
      explorer: "Etherscan",
      blockUrl: (block) => `https://sepolia.etherscan.io/block/${block}`,
      txUrl: (hash) => `https://sepolia.etherscan.io/tx/${hash}`,
    },
  ],
  [
    314,
    {
      explorer: "Filfox",
      blockUrl: (block) => `https://filfox.info/en/tipset/${block}`,
      txUrl: (hash) => `https://filfox.info/en/message/${hash}`,
    },
  ],
  [
    314159,
    {
      explorer: "Filfox",
      blockUrl: (block) => `https://calibration.filfox.info/en/tipset/${block}`,
      txUrl: (hash) => `https://calibration.filfox.info/en/message/${hash}`,
    },
  ],
  [
    421613,
    {
      explorer: "Arbiscan",
      blockUrl: (block) => `https://testnet.arbiscan.io/block/${block}`,
      txUrl: (hash) => `https://testnet.arbiscan.io/tx/${hash}`,
    },
  ],
  [
    42161,
    {
      explorer: "Arbiscan",
      blockUrl: (block) => `https://arbiscan.io/block/${block}`,
      txUrl: (hash) => `https://arbiscan.io/tx/${hash}`,
    },
  ],
  [
    42170,
    {
      explorer: "Arbiscan",
      blockUrl: (block) => `https://nova.arbiscan.io/block/${block}`,
      txUrl: (hash) => `https://nova.arbiscan.io/tx/${hash}`,
    },
  ],
  [
    10,
    {
      explorer: "Etherscan",
      blockUrl: (block) => `https://optimistic.etherscan.io/block/${block}`,
      txUrl: (hash) => `https://optimistic.etherscan.io/tx/${hash}`,
    },
  ],
  [
    420,
    {
      explorer: "Blockscout",
      blockUrl: (block) =>
        `https://optimism-goerli.blockscout.com/block/${block}`,
      txUrl: (hash) => `https://optimism-goerli.blockscout.com/tx/${hash}`,
    },
  ],
  [
    137,
    {
      explorer: "PolygonScan",
      blockUrl: (block) => `https://polygonscan.com/block/${block}`,
      txUrl: (hash) => `https://polygonscan.com/tx/${hash}`,
    },
  ],
  [
    80001,
    {
      explorer: "PolygonScan",
      blockUrl: (block) => `https://mumbai.polygonscan.com/block/${block}`,
      txUrl: (hash) => `https://mumbai.polygonscan.com/tx/${hash}`,
    },
  ],
]);

const openSeaLinks = new Map<
  number,
  {
    tokenUrl: (tokenId: string) => string;
  }
>([
  [
    1,
    {
      tokenUrl: (tokenId) =>
        `https://opensea.io/assets/ethereum/0x012969f7e3439a9b04025b5a049eb9bad82a8c12/${tokenId}`,
    },
  ],
  [
    421613,
    {
      tokenUrl: (tokenId) =>
        `https://testnets.opensea.io/assets/arbitrum-goerli/0x033f69e8d119205089ab15d340f5b797732f646b/${tokenId}`,
    },
  ],
  [
    42161,
    {
      tokenUrl: (tokenId) =>
        `https://opensea.io/assets/arbitrum/0x9abd75e8640871a5a20d3b4ee6330a04c962affd/${tokenId}`,
    },
  ],
  [
    42170,
    {
      tokenUrl: (tokenId) =>
        `https://opensea.io/assets/arbitrum-nova/0x1a22854c5b1642760a827f20137a67930ae108d2/${tokenId}`,
    },
  ],
  [
    10,
    {
      tokenUrl: (tokenId) =>
        `https://opensea.io/assets/optimism/0xfad44bf5b843de943a09d4f3e84949a11d3aa3e6/${tokenId}`,
    },
  ],
  [
    420,
    {
      tokenUrl: (tokenId) =>
        `https://testnets.opensea.io/assets/optimism-goerli/0xc72e8a7be04f2469f8c2db3f1bdf69a7d516abba/${tokenId}`,
    },
  ],
  [
    137,
    {
      tokenUrl: (tokenId) =>
        `https://opensea.io/assets/matic/0x5c4e6a9e5c1e1bf445a062006faf19ea6c49afea/${tokenId}`,
    },
  ],
  [
    80001,
    {
      tokenUrl: (tokenId) =>
        `https://testnets.opensea.io/assets/mumbai/0x4b48841d4b32c4650e4abc117a03fe8b51f38f68/${tokenId}`,
    },
  ],
]);

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
    <div className="flex-1 space-y-4 p-4 pl-0">
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
            <p className="text-xs text-muted-foreground">View on Tablescan</p>
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
