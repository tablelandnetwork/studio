"use client";

import {
  Database,
  Validator,
  type WaitableTransactionReceipt,
  helpers,
} from "@tableland/sdk";
import {
  generateCreateTableStatement,
  type schema,
} from "@tableland/studio-store";
import { providers } from "ethers";
import { AlertCircle, CheckCircle2, CircleDashed, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useWalletClient, type WalletClient } from "wagmi";
import {
  getNetwork,
  getWalletClient,
  switchNetwork,
  waitForTransaction,
} from "wagmi/actions";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ChainSelector from "@/components/chain-selector";

export default function ExecDeployment({
  team,
  project,
  environment,
  table,
}: {
  team: schema.Team;
  project: schema.Project;
  environment: schema.Environment;
  table: schema.Table;
}) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [pendingDeploy, startDeployTransition] = useTransition();
  const [signerState, setSignerState] = useState<
    "pending" | "processing" | "complete" | Error
  >("pending");
  const [txnState, setTxnState] = useState<
    "pending" | "processing" | "complete" | Error
  >("pending");
  const [tblReceiptState, setTblRecieptState] = useState<
    "pending" | "processing" | "complete" | Error
  >("pending");
  const [recordDeploymentState, setRecordDeploymentState] = useState<
    "pending" | "processing" | "complete" | Error
  >("pending");

  useEffect(() => {
    setShowDialog(true);
  }, []);

  const recordDeployment = api.deployments.recordDeployment.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const handleDeploy = async () => {
    startDeployTransition(async () => {
      let signer: providers.JsonRpcSigner;
      let tbl: Database;
      let txn: WaitableTransactionReceipt;

      setSignerState("processing");
      try {
        if (!chainId) {
          throw new Error("No chain selected");
        }
        const currentNetwork = getNetwork();
        if (currentNetwork.chain?.id !== chainId) {
          await switchNetwork({ chainId });
        }
        const walletClient = await getWalletClient({
          chainId,
        });
        if (!walletClient) {
          throw new Error("Unable to get wallet client");
        }
        signer = walletClientToSigner(walletClient);
      } catch (error) {
        setSignerState(
          error instanceof Error ? error : new Error(String(error)),
        );
        return;
      }
      setSignerState("complete");

      setTxnState("processing");
      try {
        tbl = new Database({
          signer,
          baseUrl: helpers.getBaseUrl(chainId),
          autoWait: false,
        });

        const stmt = generateCreateTableStatement(table.name, table.schema);
        const res = await tbl.prepare(stmt).all();
        if (res.error) {
          throw new Error(res.error);
        }
        if (!res.success) {
          throw new Error("Unsucessful call to exec transaction");
        }
        if (!res.meta.txn) {
          throw new Error("No transaction found in metadata");
        }
        txn = res.meta.txn;
        const evmReceipt = await waitForTransaction({
          hash: txn.transactionHash as `0x${string}`,
        });
        if (evmReceipt.status === "reverted") {
          throw new Error("Transaction reverted");
        }
      } catch (error) {
        setTxnState(error instanceof Error ? error : new Error(String(error)));
        return;
      }
      setTxnState("complete");

      setTblRecieptState("processing");
      try {
        const validator = new Validator(tbl.config);
        const receipt = await validator.pollForReceiptByTransactionHash({
          chainId,
          transactionHash: txn.transactionHash,
        });
        if (receipt.error) {
          throw new Error(receipt.error);
        }
      } catch (error) {
        setTblRecieptState(
          error instanceof Error ? error : new Error(String(error)),
        );
        return;
      }
      setTblRecieptState("complete");

      setRecordDeploymentState("processing");
      try {
        await recordDeployment.mutateAsync({
          tableId: table.id,
          environmentId: environment.id,
          tableName: txn.name,
          chainId: txn.chainId,
          tokenId: txn.tableId,
          createdAt: new Date(),
          blockNumber: txn.blockNumber,
          txnHash: txn.transactionHash,
        });
      } catch (error) {
        setRecordDeploymentState(
          error instanceof Error ? error : new Error(String(error)),
        );
        return;
      }
      setRecordDeploymentState("complete");

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setShowDialog(false);
    });
  };

  const handleCancel = () => {
    handleOnOpenChange(false);
  };

  const handleOnOpenChange = (open: boolean) => {
    setShowDialog(open);
    if (!open) {
      router.replace(`/${team.slug}/${project.slug}/deployments`);
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={handleOnOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deploy Table: {table.name}</DialogTitle>
          <DialogDescription>
            Deploying a Table to Tableland will require you to sign and send a
            transaction, as well as pay any transaction fees. Once the Table has
            been deployed, it will be registered with your Studio Project and
            you&apos;ll be able to view it in the Deployments tab.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Label>Deploy to</Label>
          <ChainSelector onValueChange={setChainId} disabled={pendingDeploy} />
        </div>
        <DeployStep
          pendingText="Resolve signer"
          processingText="Resolving signer..."
          completeText="Signer resolved"
          state={signerState}
        />
        <DeployStep
          pendingText="Wait for transaction"
          processingText="Waiting for transaction..."
          completeText="Transaction complete"
          state={txnState}
        />
        <DeployStep
          pendingText="Confirmation from the Tableland network"
          processingText="Getting confirmation from the Tableland network..."
          completeText="Tableland network confirmation received"
          state={tblReceiptState}
        />
        <DeployStep
          pendingText="Register Deployment with Studio"
          processingText="Registering Deployment with Studio..."
          completeText="Deployment registered with Studio"
          state={recordDeploymentState}
        />
        <DialogDescription>
          <span className="font-semibold text-foreground">Important:</span>{" "}
          Don&apos;t close or navigate away from this dialog while the
          Deployment is executing. If you do, or if you cancel, you&apos;ll
          likely still pay transaction fees and your table will still be created
          on Tableland, but not be registered with Studio.
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            // TODO: `handleSubmit` creates a floating promise, as a result the linter is complaining
            //    we should figure out if this is ok or not and either change this or the lint config
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={handleDeploy}
            disabled={pendingDeploy || !chainId}
          >
            {pendingDeploy && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Deploy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeployStep({
  pendingText,
  processingText,
  completeText,
  state,
}: {
  pendingText: string;
  processingText: string;
  completeText: string;
  state: "pending" | "processing" | "complete" | Error;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        state === "pending" && "opacity-40",
      )}
    >
      {state === "pending" && (
        <CircleDashed className="mr-2 h-5 w-5 flex-shrink-0" />
      )}
      {state === "processing" && (
        <Loader2 className="mr-2 h-5 w-5 flex-shrink-0 animate-spin" />
      )}
      {state === "complete" && (
        <CheckCircle2 className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
      )}
      {state instanceof Error && (
        <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 text-red-500" />
      )}
      <p className="text-sm">{text()}</p>
    </div>
  );

  function text() {
    switch (state) {
      case "pending":
        return pendingText;
      case "processing":
        return processingText;
      case "complete":
        return completeText;
      default:
        return state.message;
    }
  }
}

export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });
  return useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient],
  );
}
