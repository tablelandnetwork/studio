"use client";

import EditableInput from "@/components/editable-input";
import { api } from "@/trpc/react";
import { schema } from "@tableland/studio-store";
import { useRouter } from "next/navigation";

export default function SettingsForm({ team }: { team: schema.Team }) {
  const router = useRouter();

  const updateTeamName = api.teams.updateTeamName.useMutation({
    onSuccess: (res) => {
      router.replace(`/${res.updatedSlug}/settings`);
      router.refresh();
    },
  });

  const handleSubmit = (value?: string) => {
    if (!value) return;
    updateTeamName.mutate({ teamId: team.id, name: value });
    console.log(value);
  };

  return (
    <>
      <EditableInput
        defaultValue={team.name}
        status={updateTeamName.status}
        onSubmit={handleSubmit}
      />
    </>
  );
}
