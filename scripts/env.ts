import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), process.argv[2] || ".env.local") });
