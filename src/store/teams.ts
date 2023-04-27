import { DISABLED } from "jotai-trpc";

import { trpcJotai } from "@/utils/trpc";
import { authAtom } from "@/store/auth";
import { registerAtom } from "@/store/auth";

export const newTeamAtom = trpcJotai.teams.newTeam.atomWithMutation();

export const userTeamsAtom = trpcJotai.teams.teamsForUser.atomWithQuery(
  async (get) => {
    get(newTeamAtom);
    get(registerAtom);
    const auth = await get(authAtom);
    return auth ? { userId: auth.user.id } : DISABLED;
  }
);
