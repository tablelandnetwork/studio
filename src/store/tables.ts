import { trpcJotai } from "@/utils/trpc";
import { DISABLED } from "jotai-trpc";

import { selectedProjectAtom } from "./projects";
import { selectedTeamAtom } from "./teams";

export const newTableAtom = trpcJotai.tables.newTable.atomWithMutation();

export const tablesFromCurrentProjectAtom =
  trpcJotai.tables.tablesForProject.atomWithQuery((get) => {
    get(newTableAtom);
    const project = get(selectedProjectAtom);
    const team = get(selectedTeamAtom);
    if (!team) {
      return DISABLED;
    }
    if (!project) {
      return DISABLED;
    }
    return { projectId: project.id, teamId: team.id };
  });
