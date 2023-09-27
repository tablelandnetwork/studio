import { Schema as SDKSchema } from "@tableland/sdk";
import { customType } from "drizzle-orm/sqlite-core";

export type Schema = SDKSchema;

export const schema = customType<{
  data: Schema;
}>({
  dataType() {
    return "text";
  },
  fromDriver(value: unknown): Schema {
    return value as Schema;
  },
  toDriver(value: Schema): string {
    return JSON.stringify(value);
  },
});
