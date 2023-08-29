import type { Config } from "drizzle-kit";

export default {
  schema: "../store/src/schema/index.ts",
  driver: "better-sqlite",
  out: "./drizzle",
} satisfies Config;
