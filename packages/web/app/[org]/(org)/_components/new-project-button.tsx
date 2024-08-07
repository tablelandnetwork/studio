"use client";

import { Plus } from "lucide-react";
import { type schema } from "@tableland/studio-store";
import { useRouter } from "next/navigation";
import NewProjectForm from "@/components/new-project-form";
import { Button } from "@/components/ui/button";

export default function NewProjectButton({
  org,
  ...props
}: { org: schema.Org } & React.ComponentProps<typeof Button>) {
  const router = useRouter();

  return (
    <NewProjectForm
      org={org}
      trigger={
        <Button variant="secondary" {...props}>
          <Plus className="mr-1 size-5" />
          New Project
        </Button>
      }
      onSuccess={(project) => {
        router.push(`/${org.slug}/${project.slug}`);
        router.refresh();
      }}
    ></NewProjectForm>
  );
}
