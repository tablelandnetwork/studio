import { z } from "zod";
import { type Schema } from "@tableland/studio-store";
import { defNameSchema } from "../common.js";

const defDescriptionSchema = z.string().trim().min(1).max(1024);

const columnNameSchema = z
  .string()
  .trim()
  .min(1)
  .regex(
    /^(?!\d)[A-Za-z0-9_]+$/,
    "Column name can't start with a number and can contain any combination of letters, numbers, and underscores.",
  );

const columnsSchema = z
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
  .max(24, "A definition can have at most 24 columns.");

const schemaSchema: z.ZodType<Schema> = z.object({
  columns: z
    .array(
      z.object({
        name: columnNameSchema,
        type: z.string().trim().min(1),
        constraints: z.array(z.string().trim().min(1)).optional(),
      }),
    )
    .min(1, "At least one column is required.")
    .max(24, "A definition can have at most 24 columns."),
  defConstraints: z.array(z.string().trim().min(1)).optional(),
});

export const defNameAvailableSchema = z.object({
  projectId: z.string().trim(),
  defId: z.string().trim().min(1).optional(),
  name: defNameSchema,
});

export const newDefFormSchema = z.object({
  name: defNameSchema,
  description: defDescriptionSchema,
  columns: columnsSchema,
});

export const newDefApiSchema = z.object({
  name: defNameSchema,
  description: defDescriptionSchema,
  schema: schemaSchema,
});

export const updateDefFormSchema = z.object({
  name: defNameSchema,
  description: defDescriptionSchema,
});

export const updateDefApiSchema = z.object({
  name: defNameSchema.optional(),
  description: defDescriptionSchema.optional(),
});

export { defNameSchema };
