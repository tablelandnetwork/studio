import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), process.argv[2] || ".env.local") });
