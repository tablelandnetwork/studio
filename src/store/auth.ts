import { atom } from "jotai";

import { Auth } from "@/lib/withSession";
import { trpcJotai } from "@/utils/trpc";

export const loginModeAtom = atom<"stopped" | "automatic" | "interactive">(
  "automatic"
);

const _authAtom = atom<Auth | undefined>(undefined);
export const authAtom = atom(
  async (get) => {
    const mode = get(loginModeAtom);
    if (mode === "stopped") {
      return;
    }
    const stored = get(_authAtom);
    if (stored) {
      return stored;
    }
    const res = await get(trpcJotai.auth.authenticated.atomWithQuery());
    return res ? res : undefined;
  },
  (_, set, auth: Auth) => {
    set(_authAtom, auth);
  }
);
