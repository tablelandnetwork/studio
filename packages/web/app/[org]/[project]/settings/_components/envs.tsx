"use client";

import { type schema } from "@tableland/studio-store";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Env from "./env";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Envs({
  project,
  envs,
  disabled,
}: {
  project: schema.Project;
  envs: schema.Environment[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const [envToDelete, setEnvToDelete] = useState<
    schema.Environment | undefined
  >();

  const utils = api.useUtils();

  const deleteEnv = api.environments.deleteEnvironment.useMutation({
    onSuccess: () => {
      router.refresh();
      void utils.environments.projectEnvironments.invalidate({
        projectId: project.id,
      });
      void utils.environments.environmentPreferenceForProject.invalidate({
        projectId: project.id,
      });
      setEnvToDelete(undefined);
    },
  });

  const handleDelete = () => {
    if (envToDelete) {
      deleteEnv.mutate({ envId: envToDelete.id });
    }
  };

  return (
    <div className="flex flex-col gap-y-0">
      {envs.map((env) => (
        <Env
          key={env.id}
          projectId={project.id}
          env={env}
          showDelete={envs.length > 1}
          onDelete={() => setEnvToDelete(env)}
          disabled={disabled}
        />
      ))}
      <Dialog
        open={!!envToDelete}
        onOpenChange={(open) => !open && setEnvToDelete(undefined)}
      >
        <DialogContent
          closeDisabled={deleteEnv.isPending}
          onPointerDownOutside={
            deleteEnv.isPending ? (e) => e.preventDefault() : undefined
          }
          onEscapeKeyDown={
            deleteEnv.isPending ? (e) => e.preventDefault() : undefined
          }
        >
          <DialogHeader>
            <DialogTitle>Delete environment {envToDelete?.name}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All data related to this environment
              will be deleted from Studio&apos;s database. This includes all
              records of table deployments in this environment. Any tables that
              were created on Tableland for this environment will continue to
              exist on Tableland, but Studio will not be aware of them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={deleteEnv.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteEnv.isPending}
            >
              {deleteEnv.isPending && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              )}
              Yes, delete environment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
