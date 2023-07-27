"use client";

import { newDeployment } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Project, Team } from "@/db/schema";
import { ChainId } from "@biconomy/core-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogProps } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { Form, useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";

interface Props extends DialogProps {
  team: Team;
  project: Project;
  tables: {
    id: string;
    slug: string;
    description: string;
    name: string;
    schema: string;
  }[];
}

const schema = z.object({
  name: z.string().min(3),
  description: z
    .string()
    .optional()
    .transform((v) => (!v ? undefined : v)),
});

export default function NewDeploymentForm({
  team,
  project,
  children,
  tables,
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

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleCancel = () => {
    setNewDeploymentName("");
    props.onOpenChange && props.onOpenChange(false);
  };

  const onSubmit = () => {};

  const [singleChain, setSingleChain] = React.useState(true);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-lg space-y-8"
      >
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="name">Deployment name</Label>
            <Input
              id="deployment-name"
              placeholder="eg staging, production, etc."
              name="deployment-name"
              value={newDeploymentName}
              onChange={(e) => setNewDeploymentName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="columns-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="same-network"
                  checked={singleChain}
                  onClick={() => {
                    setSingleChain(!singleChain);
                  }}
                />
                <Label htmlFor="same-network">Single chain deployment</Label>
              </div>
              <Select
                name="network"
                value={chain}
                onValueChange={(e) => {
                  setChain(e);
                }}
              >
                <SelectTrigger
                  className={`w-[220px] ${!singleChain && "invisible"}`}
                >
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
            {tables.map((table) => {
              return (
                <div className="columns-2" key={table.name}>
                  <div className="space-y-2">
                    <Label htmlFor="name">{table.name}</Label>
                  </div>
                  <div className="space-y-2">
                    <Select
                      name="network"
                      value={chain}
                      onValueChange={(e) => {
                        setChain(e);
                      }}
                    >
                      <SelectTrigger
                        className={`w-[220px] ${singleChain && "invisible"}`}
                      >
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
              );
            })}
          </div>
        </div>
        {!!error && <p>{error}</p>}

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
      </form>
    </Form>
  );
}
