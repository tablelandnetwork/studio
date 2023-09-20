import SmartAccount from "@biconomy/smart-account";
import { Web3Provider } from "@ethersproject/providers";
import { Auth } from "@tableland/studio-api";
import { atom } from "jotai";

export const providerAtom = atom<Web3Provider | null>(null);
export const accountAtom = atom<string | null>(null);
export const smartAccountAtom = atom<SmartAccount | null>(null);
export const scwAddressAtom = atom<string | null>(null);
export const scwLoadingAtom = atom(false);
export const loggingInAtom = atom(false);
export const authAtom = atom<Auth | undefined>(undefined);
