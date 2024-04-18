"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { schema } from "@tableland/studio-store";

export default function DeleteButton({ team }: { team: schema.Team }) {
  const deleteTeam = api.teams.deleteTeam.useMutation();

  const handleClick = () => {
    deleteTeam.mutate({ teamId: team.id });
  };

  return (
    <Button variant="destructive" onClick={handleClick}>
      Delete
    </Button>
  );
}
