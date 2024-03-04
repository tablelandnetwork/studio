import AddressDisplay from "@/components/address-display";
import { chainsMap } from "@/lib/chains-map";
import { cn } from "@/lib/utils";
import { getSqlLog } from "@/lib/validator-queries";
import TimeAgo from "javascript-time-ago";
import { AlertCircle, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardMainContent,
  CardSubContent,
  CardTitle,
} from "./_components/card";
import { blockExplorers } from "@/lib/block-explorers";
import ExplorerButton from "./_components/explorer-button";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const timeAgo = new TimeAgo("en-US");

export default async function TxnPage({
  params,
}: {
  params: { chainId: string; txnHash: string };
}) {
  const chainNumber = parseInt(params.chainId, 10);
  const log = await getSqlLog(chainNumber, params.txnHash);

  const chain = chainsMap.get(chainNumber);

  if (!chain) {
    notFound();
  }

  const explorer = blockExplorers.get(chainNumber);

  return (
    <div className="container flex flex-col gap-10 pt-10">
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
        <AddressDisplay
          address={log.txHash}
          name="txn hash"
          numCharacters={8}
          copy
          className={cn("text-3xl font-bold", log.error && "text-red-500")}
        />
        {explorer && (
          <ExplorerButton
            explorerName={explorer.explorer}
            txnUrl={explorer.txUrl(params.txnHash)}
          />
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardTitle>Sent by</CardTitle>
          <CardContent>
            <CardMainContent>
              <AddressDisplay
                address={log.caller}
                copy
                className="self-center text-3xl font-medium text-black"
              />
            </CardMainContent>
          </CardContent>
        </Card>
        <Card>
          <CardTitle>Timestamp</CardTitle>
          <CardContent>
            <CardMainContent>
              {timeAgo.format(log.timestamp * 1000)}
            </CardMainContent>
            <CardSubContent>
              {new Date(log.timestamp * 1000).toLocaleString()}
            </CardSubContent>
          </CardContent>
        </Card>
        <Card>
          <CardTitle>Status</CardTitle>
          <CardContent>
            <CardMainContent>{log.error ? "Error" : "Success"}</CardMainContent>
          </CardContent>
        </Card>
        <Card>
          <CardTitle>Chain ID</CardTitle>
          <CardContent>
            <CardMainContent>{chainNumber}</CardMainContent>
            <CardSubContent>{chain.name}</CardSubContent>
          </CardContent>
        </Card>
        <Card>
          <CardTitle>Block Number</CardTitle>
          <CardContent>
            <CardMainContent>{log.blockNumber}</CardMainContent>
            {explorer && (
              <CardSubContent>
                <Link href={explorer.blockUrl(log.blockNumber)}>
                  View on {explorer.explorer}
                </Link>
              </CardSubContent>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardTitle>Event Index</CardTitle>
          <CardContent>
            <CardMainContent>{log.eventIndex}</CardMainContent>
          </CardContent>
        </Card>
        <Card>
          <CardTitle>Event Type</CardTitle>
          <CardContent>
            <CardMainContent>
              {log.eventType === "ContractCreateTable"
                ? "Create Table"
                : "Run SQL"}
            </CardMainContent>
          </CardContent>
        </Card>
      </div>
      <div>
        <label className="text-sm uppercase text-muted-foreground">
          Statement:
        </label>
        <pre className="whitespace-break-spaces rounded-sm border border-gray-300 bg-gray-100 p-4">
          {log.statement}
        </pre>
      </div>
      {log.error && (
        <div>
          <label className="text-sm uppercase text-muted-foreground">
            Error:
          </label>
          <pre className="whitespace-break-spaces rounded-sm border border-gray-300 bg-gray-100 p-4">
            {log.error}
          </pre>
        </div>
      )}
    </div>
  );
}
