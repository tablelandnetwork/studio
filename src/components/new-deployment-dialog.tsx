import { DialogProps } from "@radix-ui/react-dialog";
import { useAtom } from "jotai";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
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
import { tablelandAtom } from "@/store/db";
import { smartAccountAtom } from "@/store/login";
import { trpc } from "@/utils/trpc";
import { ChainId } from "@biconomy/core-types";
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
  const [tbl] = useAtom(tablelandAtom);

  const [NewDeploymentName, setNewDeploymentName] = React.useState("");

  const [NewDeploymentChain, setNewDeploymentChain] = React.useState("");
  const [NewDeploymentDescription, setNewDeploymentDescription] =
    React.useState("");

  const [creatingDeployment, setCreatingDeployment] = React.useState(false);
  const [error, setError] = React.useState("");
  const router = useRouter();

  const newDeployment = trpc.deployments.newDeployment.useMutation();
  const [chain, setChain] = React.useState<string | undefined>();

  const handleNewDeployment = async () => {
    if (!NewDeploymentName.length) return;
    //
    setError("");
    setCreatingDeployment(true);

    if (!tbl) return;

    const inserts = tables.map((table) => {
      return tbl.prepare(table.schema);
    });

    const [res] = await tbl.batch(inserts);

    const acc = await smartAccountAtom;

    const deployment = {
      transactionHash: res.meta.txn.transactionHash,
      block: res.meta.txn.blockNumber.toString(),
      tables: res.meta.meta.txn.names.map((name: string, key: number) => {
        return {
          name,
          schema: tables[key].schema,
          tableId: tables[key].id,
        };
      }),
      projectId: project.id,
      chain: ChainId.POLYGON_MUMBAI.toString(),
      deployedBy: "", // acc.smartAccountWalletAddress
    };

    try {
      const dep = newDeployment.mutate(deployment);
      setCreatingDeployment(false);
      setNewDeploymentName("");
      setNewDeploymentDescription("");
      setNewDeploymentChain("");
      if (props.onOpenChange) {
        props.onOpenChange(false);
      }

      // router.push(`/${team.slug}/${project.slug}/${deployment?.slug}`);
    } catch (err: any) {
      // TODO: Figure out how to handle this error from tRPC.
      setError("There was an error creating your Deployment.");
      setCreatingDeployment(false);
    }
  };

  const handleCancel = () => {
    setCreatingDeployment(false);
    setNewDeploymentName("");
    setNewDeploymentDescription("");
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
                    <SelectItem value="maticmum">
                      Matic Mumbai (sponsored)
                    </SelectItem>
                    <SelectItem value={ChainId.POLYGON_MUMBAI.toString()}>
                      Arbitrum Nova (sponsored)
                    </SelectItem>
                    <SelectItem value="filecoin-calibration">
                      Filecoin Calibration
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
