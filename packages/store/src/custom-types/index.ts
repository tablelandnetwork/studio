import { type Schema as SDKSchema } from "@tableland/sdk";
import { customType } from "drizzle-orm/sqlite-core";
import { unescapeSchema } from "../helpers.js";

export type Schema = SDKSchema;

export const schema = customType<{
  data: Schema;
}>({
  dataType() {
    return "text";
  },
  fromDriver(value: unknown): Schema {
    // We are already storing some Schema values that have escaped identifiers.
    // This isn't ideal, but for now we'll just unescape all Schemas as we read
    // them from the database.
    const schema = value as Schema;
    return unescapeSchema(schema);
  },
  toDriver(value: Schema): string {
    return JSON.stringify(value);
  },
});
