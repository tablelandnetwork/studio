import type { Config } from "drizzle-kit";

export default {
  schema: "../store/dist/schema/index.js",
  driver: "better-sqlite",
  out: "./drizzle",
} satisfies Config;
