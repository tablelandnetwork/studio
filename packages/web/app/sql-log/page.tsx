import TimeAgo from "javascript-time-ago";
import { AlertCircle } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import ExplorerButton from "./_components/explorer-button";
import {
  MetricCard,
  MetricCardContent,
  MetricCardFooter,
  MetricCardHeader,
  MetricCardTitle,
} from "@/components/metric-card";
import HashDisplay from "@/components/hash-display";
import { chainsMap } from "@/lib/chains-map";
import { cn } from "@/lib/utils";
import { getSqlLog } from "@/lib/validator-queries";
import { blockExplorers } from "@/lib/block-explorers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const timeAgo = new TimeAgo("en-US");

export default async function TxnPage({
  searchParams,
}: {
  searchParams: { chainId: string; txnHash: string; index: number };
}) {
  const chainNumber = parseInt(searchParams.chainId, 10);
  const log = await getSqlLog(
    chainNumber,
    searchParams.txnHash,
    searchParams.index,
  );

  const chain = chainsMap.get(chainNumber);

  if (!chain) {
    notFound();
  }

  const explorer = blockExplorers.get(chainNumber);

  return (
    <div className="container flex flex-col gap-10 py-10">
      <div className="flex items-center gap-2">
        {log.error && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle />
              </TooltipTrigger>
              <TooltipContent>Txn Status: Error</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <div className="flex flex-col">
          <HashDisplay
            hash={log.txHash}
            hashDesc="txn hash"
            numCharacters={8}
            copy
            className={cn(
              "text-3xl font-bold text-foreground",
              log.error && "text-red-500",
            )}
          />
          <div className="text-base text-muted-foreground">
            Log index:{" "}
            <span className="font-bold text-foreground">{log.eventIndex}</span>
          </div>
        </div>
        {explorer && (
          <ExplorerButton
            explorerName={explorer.explorer}
            txnUrl={explorer.txUrl(searchParams.txnHash)}
          />
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {log.caller && (
          <MetricCard>
            <MetricCardHeader>
              <MetricCardTitle>Sent by</MetricCardTitle>
            </MetricCardHeader>
            <MetricCardContent>
              <HashDisplay
                hash={log.caller}
                copy
                className="text-3xl text-foreground"
              />
            </MetricCardContent>
          </MetricCard>
        )}
        <MetricCard>
          <MetricCardHeader>
            <MetricCardTitle>Timestamp</MetricCardTitle>
          </MetricCardHeader>
          <MetricCardContent>
            {timeAgo.format(log.timestamp * 1000)}
          </MetricCardContent>
          <MetricCardFooter>
            {new Date(log.timestamp * 1000).toLocaleString()}
          </MetricCardFooter>
        </MetricCard>
        <MetricCard>
          <MetricCardHeader>
            <MetricCardTitle>Status</MetricCardTitle>
          </MetricCardHeader>
          <MetricCardContent>
            {log.error ? "Error" : "Success"}
          </MetricCardContent>
        </MetricCard>
        <MetricCard>
          <MetricCardHeader>
            <MetricCardTitle>Chain Id</MetricCardTitle>
          </MetricCardHeader>
          <MetricCardContent>{chainNumber}</MetricCardContent>
          <MetricCardFooter>{chain.name}</MetricCardFooter>
        </MetricCard>
        <MetricCard>
          <MetricCardHeader>
            <MetricCardTitle>Block Number</MetricCardTitle>
          </MetricCardHeader>
          <MetricCardContent>{log.blockNumber}</MetricCardContent>
          {explorer && (
            <MetricCardFooter>
              <Link href={explorer.blockUrl(log.blockNumber)}>
                View on {explorer.explorer}
              </Link>
            </MetricCardFooter>
          )}
        </MetricCard>
        <MetricCard>
          <MetricCardHeader>
            <MetricCardTitle>Txn Index</MetricCardTitle>
          </MetricCardHeader>
          <MetricCardContent>{log.txIndex}</MetricCardContent>
        </MetricCard>
        <MetricCard>
          <MetricCardHeader>
            <MetricCardTitle>Event Type</MetricCardTitle>
          </MetricCardHeader>
          <MetricCardContent>
            {log.eventType === "ContractCreateTable"
              ? "Create Table"
              : "Run SQL"}
          </MetricCardContent>
        </MetricCard>
      </div>
      <div>
        <label className="text-sm uppercase text-muted-foreground">
          Statement:
        </label>
        <pre className="whitespace-break-spaces rounded-sm border p-4">
          {log.statement}
        </pre>
      </div>
      {log.error && (
        <div>
          <label className="text-sm uppercase text-muted-foreground">
            Error:
          </label>
          <pre className="whitespace-break-spaces rounded-sm border p-4">
            {log.error}
          </pre>
        </div>
      )}
    </div>
  );
}
