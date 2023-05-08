import { trpcJotai } from "@/utils/trpc";

export const newTableAtom = trpcJotai.tables.newTable.atomWithMutation();
