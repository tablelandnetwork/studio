import { type Auth } from "@tableland/studio-api";
import { atom } from "jotai";

export const authAtom = atom<Auth | undefined>(undefined);
