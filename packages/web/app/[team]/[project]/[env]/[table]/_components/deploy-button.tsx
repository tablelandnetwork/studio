"use client";

import { Rocket } from "lucide-react";
import { useState } from "react";
import { type Schema, type schema } from "@tableland/studio-store";
import { useRouter } from "next/navigation";
import ExecDeployment from "@/components/exec-deployment";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

export default function DeployButton({
  def,
  env,
}: {
  env: schema.Environment;
  def: {
    id: string;
    name: string;
    schema: Schema;
  };
}) {
  const [openExecDeployModal, setOpenExecDeployModal] = useState(false);
  const router = useRouter();

  const deploymentsQuery = api.deployments.deploymentsByEnvironmentId.useQuery({
    environmentId: env.id,
  });

  const handleDeploy = () => {
    setOpenExecDeployModal(true);
  };

  const onSuccessfulDeploy = (deployment: schema.Deployment) => {
    void deploymentsQuery.refetch();
    router.refresh();
  };

  return (
    <>
      <ExecDeployment
        open={openExecDeployModal}
        onOpenChange={setOpenExecDeployModal}
        def={def}
        environment={env}
        onSuccess={onSuccessfulDeploy}
      />
      <Button className="gap-2" onClick={handleDeploy}>
        <Rocket /> Deploy table
      </Button>
    </>
  );
}
