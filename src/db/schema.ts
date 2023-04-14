import { integer, text } from "drizzle-orm/sqlite-core";
import { InferModel } from "drizzle-orm";
import { tablelandTable } from "@/lib/drizzle";

export const teams = tablelandTable("teams", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

export const users = tablelandTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  age: integer("age").default(40),
});

export type User = InferModel<ReturnType<typeof users>>;
export type NewUser = InferModel<ReturnType<typeof users>, "insert">;
