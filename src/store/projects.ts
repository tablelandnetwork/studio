import { atom } from "jotai";
import { DISABLED } from "jotai-trpc";

import { Project } from "@/db/schema";
import { selectedTeamAtom } from "@/store/teams";
import { trpcJotai } from "@/utils/trpc";

export const newProjectAtom = trpcJotai.projects.newProject.atomWithMutation();

export const selectedProjectAtom = atom<Project | null>(null);

export const projectsForCurrentTeamAtom =
  trpcJotai.projects.projectsForTeam.atomWithQuery((get) => {
    get(newProjectAtom);
    const team = get(selectedTeamAtom);
    if (!team) {
      return DISABLED;
    }
    return { teamId: team.id };
  });
