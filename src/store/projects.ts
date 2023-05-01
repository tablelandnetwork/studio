import { DISABLED } from "jotai-trpc";

import { selectedTeamAtom } from "@/store/teams";
import { trpcJotai } from "@/utils/trpc";

export const newProjectAtom = trpcJotai.projects.newProject.atomWithMutation();

export const projectsForCurrentTeamAtom =
  trpcJotai.projects.projectsForTeam.atomWithQuery((get) => {
    get(newProjectAtom);
    const team = get(selectedTeamAtom);
    if (!team) {
      return DISABLED;
    }
    return { teamId: team.id };
  });
