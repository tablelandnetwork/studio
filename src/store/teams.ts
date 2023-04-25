import { atom } from "jotai";

import { trpcJotai } from "@/utils/trpc";
import { authAtom } from "@/store/auth";

export const newTeamAtom = trpcJotai.teams.newTeam.atomWithMutation();

export const userTeamsAtom = atom(async (get) => {
  get(newTeamAtom);
  const auth = await get(authAtom);
  if (auth) {
    return get(
      trpcJotai.teams.teamsForUser.atomWithQuery({ userId: auth.userId })
    );
  }
});
