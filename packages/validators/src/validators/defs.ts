import { z } from "zod";
import { type Schema } from "@tableland/studio-store";
import { sqliteKeywords } from "../sqlite-keywords";
import { defNameSchema } from "../common";

const columnNameSchema = z
  .string()
  .trim()
  .nonempty()
  .regex(
    /^(?!\d)[A-Za-z0-9_]+$/,
    "Column name can't start with a number and can contain any combination of letters, numbers, and underscores.",
  )
  .refine((val) => !sqliteKeywords.includes(val.toUpperCase()), {
    message: "You can't use a SQL keyword as a column name.",
  });

export const defNameAvailableSchema = z.object({
  projectId: z.string().trim(),
  defId: z.string().trim().nonempty().optional(),
  name: defNameSchema,
});

export const newDefFormSchema = z.object({
  name: defNameSchema,
  description: z.string().trim().nonempty(),
  columns: z
    .array(
      z.object({
        id: z.string(),
        name: columnNameSchema,
        type: z.enum(["int", "integer", "text", "blob"]),
        notNull: z.boolean(),
        primaryKey: z.boolean(),
        unique: z.boolean(),
      }),
    )
    .min(1, "At least one column is required.")
    .max(24, "A definition can have at most 24 columns."),
});

const schemaSchema: z.ZodType<Schema> = z.object({
  columns: z
    .array(
      z.object({
        name: columnNameSchema,
        type: z.string().trim().nonempty(),
        constraints: z.array(z.string().trim().nonempty()).optional(),
      }),
    )
    .min(1, "At least one column is required.")
    .max(24, "A definition can have at most 24 columns."),
  defConstraints: z.array(z.string().trim().nonempty()).optional(),
});

export const newDefApiSchema = z.object({
  name: defNameSchema,
  description: z.string().trim().nonempty().max(1024),
  schema: schemaSchema,
});
