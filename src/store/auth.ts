import { atom } from "jotai";
import { Auth } from "@/lib/withSession";

export const authAtom = atom<Auth | null>(null);
