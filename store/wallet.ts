import { Auth } from "@/lib/session";
import { Web3Provider } from "@ethersproject/providers";
import { atom } from "jotai";

export const providerAtom = atom<Web3Provider | null>(null);
export const accountAtom = atom<string | null>(null);
export const scwAddressAtom = atom<string | null>(null);
export const scwLoadingAtom = atom(false);
export const loggingInAtom = atom(false);
export const authAtom = atom<Auth | null>(null);
