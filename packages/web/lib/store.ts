import { init } from "@tableland/studio-store";
import { tbl } from "./tbl";

export const store = init(tbl, process.env.DATA_SEAL_PASS!);
