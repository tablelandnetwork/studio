import { init } from "./api";
import { Schema } from "./custom-types";
import * as schema from "./schema";

type Store = ReturnType<typeof init>;

export * from "./helpers";
export { Schema, Store, init, schema };
