import { DialogProps } from "@radix-ui/react-dialog";
import { useAtom } from "jotai";
import { Loader2 } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Project, Table, Team } from "@/db/schema";
import SmartAccountDatabase from "@/lib/smartAccountTableland";
import { accountAtom } from "@/store/db";
import { trpc } from "@/utils/trpc";
import { ChainId } from "@biconomy/core-types";
import { Validator } from "@tableland/sdk";
import { useRouter } from "next/router";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Props extends DialogProps {
  project: Project;
  team: Team;
  tables: Table[];
}

export default function NewDeploymentDialog({
  project,
  team,
  children,
  tables,
  ...props
}: Props) {
  const [account] = useAtom(accountAtom);

  const router = useRouter();
  const [NewDeploymentName, setNewDeploymentName] = React.useState("");

  const [creatingDeployment, setCreatingDeployment] = React.useState(false);
  const [error, setError] = React.useState("");

  const newDeployment = trpc.deployments.newDeployment.useMutation();
  const [chain, setChain] = React.useState<string>("80001");

  const handleNewDeployment = async () => {
    try {
      if (!NewDeploymentName.length) return;

      setError("");
      setCreatingDeployment(true);

      if (!account) {
        throw new Error("No smart account attached");
      }
      await account.setActiveChain(parseInt(chain));

      const tbl = SmartAccountDatabase(account);

      const inserts = tables.map((table) => {
        return tbl.prepare(table.schema);
      });

      const [r] = await tbl.batch(inserts);

      const res = await r.results.wait();

      const v = Validator.forChain(parseInt(chain));

      // TODO: This is _not_ how the transaction hash should be accessed, but it's how the SDK is currently
      // returning it, soo... fix ASAP, once SDK is fixed.
      const receipt = await v.receiptByTransactionHash({
        transactionHash: res.transactionHash || "",
        chainId: parseInt(chain),
      });

      const deployment = {
        transactionHash: res.transactionHash,
        block: receipt.blockNumber.toString(),
        tables: await Promise.all(
          receipt.tableIds.map(async (tableId: string, key: number) => {
            const tbl = await v.getTableById({
              chainId: parseInt(chain),
              tableId,
            });

            return {
              name: tbl.name,
              schema: tables[key].schema,
              tableId: tableId,
            };
          })
        ),
        projectId: project.id,
        chain: chain,
        deployedBy: account.address,
      };

      const dep = newDeployment.mutate(deployment);
      setCreatingDeployment(false);
      setNewDeploymentName("");
      setChain("");
      if (props.onOpenChange) {
        props.onOpenChange(false);
      }

      router.replace(router.asPath);
    } catch (err: any) {
      // TODO: Figure out how to handle this error from tRPC.
      setError("There was an error creating your Deployment.");
      console.error(err);
      setCreatingDeployment(false);
    }
  };

  const handleCancel = () => {
    setCreatingDeployment(false);
    setNewDeploymentName("");
    setError("");
    if (props.onOpenChange) {
      props.onOpenChange(false);
    }
  };

  return (
    <Dialog {...props}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new deployment</DialogTitle>
          <DialogDescription>
            Name your deployment and select it&apos;s network.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Table Name</Label>
              <Input
                id="deployment-name"
                placeholder="Deployment Name"
                name="deployment-name"
                value={NewDeploymentName}
                onChange={(e) => setNewDeploymentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="network">Network</Label>
              <Select
                name="network"
                value={chain}
                onValueChange={(e) => {
                  setChain(e);
                }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select a blockchain network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={ChainId.POLYGON_MUMBAI.toString()}>
                      Matic Mumbai (sponsored)
                    </SelectItem>
                    <SelectItem
                      value={ChainId.ARBITRUM_NOVA_MAINNET.toString()}
                    >
                      Arbitrum Nova (sponsored)
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          {!!error && <p>{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={creatingDeployment}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleNewDeployment}
            disabled={creatingDeployment}
          >
            {creatingDeployment && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
