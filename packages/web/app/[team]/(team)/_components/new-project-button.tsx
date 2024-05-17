"use client";

import { Plus } from "lucide-react";
import { type schema } from "@tableland/studio-store";
import { useRouter } from "next/navigation";
import NewProjectForm from "@/components/new-project-form";
import { Button } from "@/components/ui/button";

export default function NewProjectButton({ team }: { team: schema.Team }) {
  const router = useRouter();

  return (
    <NewProjectForm
      team={team}
      trigger={
        <Button variant="ghost" className="ml-auto">
          <Plus className=" mr-2" />
          New Project
        </Button>
      }
      onSuccess={(project) => {
        router.refresh();
        // TODO: Deal with multiple envs
        router.push(`/${team.slug}/${project.slug}/default`);
      }}
    ></NewProjectForm>
  );
}
