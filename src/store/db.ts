import SmartAccount from "@biconomy/smart-account";
import { atom } from "jotai";

export const accountAtom = atom<SmartAccount | null>(null);
