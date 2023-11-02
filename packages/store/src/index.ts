import { init } from "./api/index.js";
import { Schema } from "./custom-types/index.js";
import * as schema from "./schema/index.js";

type Store = ReturnType<typeof init>;

export * from "./helpers.js";
export { Schema, Store, init, schema };
