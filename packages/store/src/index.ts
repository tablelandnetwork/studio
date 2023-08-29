import { init } from "./api";
import * as schema from "./schema";

type Store = ReturnType<typeof init>;

export { Store, init, schema };
