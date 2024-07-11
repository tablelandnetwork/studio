import { Database, type Schema, helpers, type Result } from "@tableland/sdk";
import { type schema } from "@tableland/studio-store";
import {
  Blocks,
  Coins,
  Hash,
  AlertCircle,
  Rocket,
  Table2,
  Workflow,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { getSession, type RouterOutputs } from "@tableland/studio-api";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import {
  MetricCard,
  MetricCardContent,
  MetricCardFooter,
  MetricCardHeader,
  MetricCardTitle,
} from "./metric-card";
import HashDisplay from "./hash-display";
import { CardContent } from "./ui/card";
import ProjectsReferencingTable from "./projects-referencing-table";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import TableDetails from "./table-details";
import DefDetails from "./def-details";
import { blockExplorers } from "@/lib/block-explorers";
import { openSeaLinks } from "@/lib/open-sea";
import { chainsMap } from "@/lib/chains-map";
import { TimeSince } from "@/components/time";
import { api } from "@/trpc/server";
import { ensureError } from "@/lib/ensure-error";
import {
  type TablePermissions,
  getTablePermissions,
} from "@/lib/validator-queries";

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

interface Props {
  tableName: string;
  chainId: number;
  tableId: string;
  owner?: string;
  createdAt: Date;
  schema: Schema;
  environment?: schema.Environment;
  defData?: DefData;
  deploymentData?: DeploymentData;
  isAuthorized?: RouterOutputs["teams"]["isAuthorized"];
}

export default async function Table({
  tableName,
  chainId,
  tableId,
  owner,
  createdAt,
  schema,
  environment,
  defData,
  deploymentData,
  isAuthorized,
}: Props) {
  const session = await cache(getSession)({
    headers: headers(),
    cookies: cookies(),
  });

  const chain = chainsMap.get(chainId);
  const blockExplorer = blockExplorers.get(chainId);
  const openSeaLink = openSeaLinks.get(chainId);

  let tablePermissions: TablePermissions | undefined;
  let authorizedStudioUsers: RouterOutputs["users"]["usersForAddresses"] = {};
  let data: Result<Record<string, unknown>> | undefined;
  let error: Error | undefined;
  try {
    const baseUrl = helpers.getBaseUrl(chainId);
    tablePermissions = await getTablePermissions(chainId, tableId);
    const authorizedAddresses = Object.keys(tablePermissions);
    authorizedStudioUsers = authorizedAddresses.length
      ? await api.users.usersForAddresses({
          addresses: authorizedAddresses,
        })
      : {};
    const tbl = new Database({ baseUrl });
    data = await tbl.prepare(`SELECT * FROM ${tableName};`).all();
  } catch (err) {
    error = ensureError(err);
  }

  const deploymentReferences = (
    await api.deployments.deploymentReferences({ chainId, tableId })
  ).filter((p) => p.environment.id !== environment?.id);

  const ownerStudioUser = owner ? authorizedStudioUsers[owner] : undefined;

  const displayName = defData?.name ?? tableName;

  return (
    <div className="flex-1 space-y-4">
      <div className="grid grid-flow-row grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {error && (
          <Alert className="col-span-full">
            <AlertCircle className="size-5 stroke-destructive" />
            <AlertTitle className="text-destructive">
              Error loading table data
            </AlertTitle>
            <AlertDescription>
              <p>{error.message}</p>
              {isAuthorized &&
                error.message.includes("cannot use unsupported chain") && (
                  <p>
                    You should undeploy this table and redeploy it to a
                    supported chain.
                  </p>
                )}
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
            <MetricCardTitle>Table</MetricCardTitle>
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
        {owner && (
          <MetricCard>
            <MetricCardHeader
              className="flex flex-row items-center gap-2 space-y-0"
              copyValue={owner}
              valueDesc="Owner address"
              tooltipText="Click to copy owner address"
            >
              <Crown className="h-4 w-4 text-muted-foreground" />
              <MetricCardTitle>Owner</MetricCardTitle>
            </MetricCardHeader>
            <MetricCardContent>
              <HashDisplay className="text-3xl text-foreground" hash={owner} />
            </MetricCardContent>
            {ownerStudioUser && (
              <MetricCardFooter>
                Studio user {ownerStudioUser.team.name}
                {ownerStudioUser.user.teamId === session.auth?.user.teamId
                  ? " (you)"
                  : ""}
              </MetricCardFooter>
            )}
          </MetricCard>
        )}
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
              <MetricCardTitle>Referenced by projects</MetricCardTitle>
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
      {owner && authorizedStudioUsers && tablePermissions && data ? (
        <TableDetails
          displayName={displayName}
          tableName={tableName}
          schema={schema}
          chainId={chainId}
          tableId={tableId}
          owner={owner}
          authorizedStudioUsers={authorizedStudioUsers}
          tablePermissions={tablePermissions}
          data={data.results}
          auth={session.auth}
        />
      ) : (
        <DefDetails name={displayName} schema={schema} />
      )}
    </div>
  );
}
