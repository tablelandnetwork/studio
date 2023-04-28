import { DISABLED } from "jotai-trpc";

import { trpcJotai } from "@/utils/trpc";
import { authAtom } from "@/store/auth";
import { registerAtom } from "@/store/register";

export const newTeamAtom = trpcJotai.teams.newTeam.atomWithMutation();

export const userTeamsAtom = trpcJotai.teams.teamsForUser.atomWithQuery(
  (get) => {
    get(newTeamAtom);
    get(registerAtom);
    const auth = get(authAtom);
    return auth ? { userId: auth.user.id } : DISABLED;
  }
);
