import { init } from "./api/index.js";
import { type Schema } from "./custom-types/index.js";
import * as schema from "./schema/index.js";

type Store = ReturnType<typeof init>;

export * from "./helpers.js";
export { type Schema, type Store, init, schema };
