import { trpcJotai } from "@/utils/trpc";
import { atom } from "jotai";
import { authAtom } from "./auth";

export const registerAtom = atom(
  null,
  async (_, set, payload: { username: string; email?: string }) => {
    const registerAuth = await set(trpcJotai.auth.register.atomWithMutation(), [
      payload,
    ]);
    set(authAtom, registerAuth);
    return registerAuth;
  }
);
