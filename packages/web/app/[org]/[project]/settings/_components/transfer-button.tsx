"use client";

import { type schema } from "@tableland/studio-store";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { skipToken } from "@tanstack/react-query";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { Button, type ButtonProps } from "@/components/ui/button";
import InputWithCheck from "@/components/input-with-check";
import { Label } from "@/components/ui/label";

export default function TransferButton({
  org,
  project,
  ...props
}: Omit<ButtonProps, "onClick"> & {
  org: schema.Org;
  project: schema.Project;
}) {
  const router = useRouter();

  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const orgBySlug = api.orgs.orgBySlug.useQuery(
    query ? { slug: query } : skipToken,
    {
      retry: false,
    },
  );

  const transferProject = api.projects.transferProject.useMutation({
    onSuccess: async () => {
      router.replace(`/${org.slug}`);
      router.refresh();
    },
  });

  const handleClick = () => {
    if (!orgBySlug.data || orgBySlug.data.slug !== value) {
      return;
    }
    transferProject.mutate({ projectId: project.id, orgId: orgBySlug.data.id });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" {...props}>
          Transfer project
        </Button>
      </DialogTrigger>
      <DialogContent
        closeDisabled={transferProject.isPending}
        onPointerDownOutside={
          transferProject.isPending ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          transferProject.isPending ? (e) => e.preventDefault() : undefined
        }
      >
        <DialogHeader>
          <DialogTitle>Transfer project?</DialogTitle>
          <DialogDescription>
            All data related to this project will be transferred to another org.
            You cannot reverse this action and will have to rely on the other
            org to transfer the project back if needed.
          </DialogDescription>
        </DialogHeader>
        <Label>Transfer to</Label>
        <InputWithCheck
          value={value}
          onChange={(e) => setValue(e.target.value)}
          queryStatus={orgBySlug}
          updateQuery={setQuery}
          placeholder="org-slug"
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={transferProject.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleClick}
            disabled={
              !orgBySlug.data ||
              orgBySlug.data.slug !== value ||
              transferProject.isPending
            }
          >
            {transferProject.isPending && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Yes, transfer project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
