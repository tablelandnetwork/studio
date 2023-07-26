"use client";

import { newDeployment } from "@/app/actions";
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
import { Project, Team } from "@/db/schema";
import { ChainId } from "@biconomy/core-types";
import { DialogProps } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Props extends DialogProps {
  team: Team;
  project: Project;
}

export default function NewProjectDialog({
  team,
  project,
  children,
  ...props
}: Props) {
  const [creatingDeployment, setCreatingDeployment] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState("");
  const [chain, setChain] = React.useState<string>("80001");
  const [newDeploymentName, setNewDeploymentName] = React.useState("");

  const router = useRouter();

  const handleNewDeployment = () => {
    if (!newDeploymentName.length) return;
    startTransition(async () => {
      const res = await newDeployment({
        transactionHash: "",
        block: 0,
        chain: parseInt(chain),
        deployedBy: "",
        // TODO: don't hard code this.  I think we want to separate creating the
        //    deployment, and executing the deployment. Executing the deployment
        //    will be when the table is created, and the uu_name is stored etc...
        tables: [
          {
            name: "something_5_2",
            schema:
              "create table something_5_2 (id int primary key, name text not null);",
            tableId: "5",
          },
        ],
        projectId: project.id,
      });
      props.onOpenChange && props.onOpenChange(false);
      setNewDeploymentName("");
      router.push(`/${team.slug}/${project.name}/${res.id}`);
      router.refresh();
    });
  };

  const handleCancel = () => {
    setNewDeploymentName("");
    props.onOpenChange && props.onOpenChange(false);
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
                value={newDeploymentName}
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
