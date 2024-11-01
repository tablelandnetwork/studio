import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "../store/dist/schema/index.js",
  dialect: "sqlite",
  driver: "d1-http",
  out: "./drizzle",
});
