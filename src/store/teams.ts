import { atom } from "jotai";
import { DISABLED } from "jotai-trpc";

import { Team } from "@/db/schema";
import { authAtom } from "@/store/auth";
import { registerAtom } from "@/store/register";
import { trpcJotai } from "@/utils/trpc";

export const selectedTeamAtom = atom<Team | null>(null);

export const newTeamAtom = trpcJotai.teams.newTeam.atomWithMutation();

export const acceptInviteAtom = trpcJotai.teams.acceptInvite.atomWithMutation();

export const userTeamsAtom = trpcJotai.teams.teamsForPersonalTeam.atomWithQuery(
  (get) => {
    get(newTeamAtom);
    get(registerAtom);
    get(acceptInviteAtom);
    const auth = get(authAtom);
    return auth ? { personalTeamId: auth.user.teamId } : DISABLED;
  }
);
