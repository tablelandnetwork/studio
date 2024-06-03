import {
  Database,
  Validator,
  type WaitableTransactionReceipt,
  helpers,
} from "@tableland/sdk";
import {
  type Schema,
  generateCreateTableStatement,
  type schema,
} from "@tableland/studio-store";
import { type JsonRpcSigner } from "ethers";
import { AlertCircle, CheckCircle2, CircleDashed, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useWalletClient } from "wagmi";
import {
  getNetwork,
  getWalletClient,
  switchNetwork,
  waitForTransaction,
} from "wagmi/actions";
import { api } from "@/trpc/react";
import { cn, walletClientToSigner } from "@/lib/utils";
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
  open,
  onOpenChange,
  environment,
  def,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  environment: schema.Environment;
  def: {
    id: string;
    name: string;
    schema: Schema;
  };
  onSuccess: (deployment: schema.Deployment) => void;
}) {
  const router = useRouter();
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [pendingDeploy, startDeployTransition] = useTransition();
  const [signerState, setSignerState] = useState<
    "pending" | "processing" | "complete" | Error
  >("pending");
  const [txnState, setTxnState] = useState<
    "pending" | "processing" | "complete" | Error
  >("pending");
  const [tblReceiptState, setTblReceiptState] = useState<
    "pending" | "processing" | "complete" | Error
  >("pending");
  const [recordDeploymentState, setRecordDeploymentState] = useState<
    "pending" | "processing" | "complete" | Error
  >("pending");

  const recordDeployment = api.deployments.recordDeployment.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const handleDeploy = async () => {
    startDeployTransition(async () => {
      let signer: JsonRpcSigner;
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

        const stmt = generateCreateTableStatement(def.name, def.schema);
        const res = await tbl.prepare(stmt).all();
        if (res.error) {
          throw new Error(res.error);
        }
        if (!res.success) {
          throw new Error("Unsuccessful call to exec transaction");
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

      setTblReceiptState("processing");
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
        setTblReceiptState(
          error instanceof Error ? error : new Error(String(error)),
        );
        return;
      }
      setTblReceiptState("complete");

      setRecordDeploymentState("processing");
      try {
        const deployment = await recordDeployment.mutateAsync({
          defId: def.id,
          environmentId: environment.id,
          tableName: txn.name,
          chainId: txn.chainId,
          tableId: txn.tableId,
          createdAt: new Date(),
          blockNumber: txn.blockNumber,
          txnHash: txn.transactionHash,
        });
        setRecordDeploymentState("complete");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        onSuccess(deployment);
        onOpenChange(false);
      } catch (error) {
        setRecordDeploymentState(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-auto flex-col gap-y-4 overflow-auto">
        <DialogHeader>
          <DialogTitle>Deploy table definition: {def.name}</DialogTitle>
          <DialogDescription>
            Deploying a definition to Tableland will require you to sign and
            send a transaction, as well as pay any transaction fees. Once the
            definition has been deployed, it will be registered with your Studio
            project and you&apos;ll be able to view it in the tables tab.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Label>Deploy to</Label>
          <ChainSelector
            onValueChange={(val) => {
              if (typeof val === "number") {
                setChainId(val);
              }
            }}
            disabled={pendingDeploy}
          />
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
          pendingText="Register deployment with Studio"
          processingText="Registering deployment with Studio..."
          completeText="Deployment registered with Studio"
          state={recordDeploymentState}
        />
        <DialogDescription>
          <span className="font-semibold text-foreground">Important:</span>{" "}
          Don&apos;t close or navigate away from this dialog while the
          deployment is executing. If you do, or if you cancel, you&apos;ll
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
        "flex-auto items-center overflow-auto",
        state === "pending" && "opacity-40",
      )}
    >
      <div className="grid grid-cols-12">
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
        <p className="col-span-11 text-sm">{text()}</p>
      </div>
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

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}):
  | JsonRpcSigner
  | undefined {
  const { data: walletClient } = useWalletClient({ chainId });
  return useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient],
  );
}
