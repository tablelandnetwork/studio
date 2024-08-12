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

  const utils = api.useUtils();

  const handleDeploy = () => {
    setOpenExecDeployModal(true);
  };

  const onSuccessfulDeploy = (deployment: schema.Deployment) => {
    void utils.deployments.deploymentsByEnvironmentId.invalidate({
      environmentId: env.id,
    });
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
        <Rocket className="size-5" />
        Deploy table
      </Button>
    </>
  );
}
