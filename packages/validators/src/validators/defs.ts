import { z } from "zod";
import { type Schema } from "@tableland/studio-store";
import { defNameSchema } from "../common";

const defDescriptionSchema = z.string().trim().nonempty().max(1024);

const columnNameSchema = z
  .string()
  .trim()
  .min(1)
  .regex(
    /^(?!\d)[A-Za-z0-9_]+$/,
    "Column name can't start with a number and can contain any combination of letters, numbers, and underscores.",
  );

export const defNameAvailableSchema = z.object({
  projectId: z.string().trim(),
  defId: z.string().trim().nonempty().optional(),
  name: defNameSchema,
});

export const newDefFormSchema = z.object({
  name: defNameSchema,
  description: defDescriptionSchema,
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
        type: z.string().trim().min(1),
        constraints: z.array(z.string().trim().min(1)).optional(),
      }),
    )
    .min(1, "At least one column is required.")
    .max(24, "A definition can have at most 24 columns."),
  defConstraints: z.array(z.string().trim().min(1)).optional(),
});

export const newDefApiSchema = z.object({
  name: defNameSchema,
  description: defDescriptionSchema,
  schema: schemaSchema,
});

export const updateDefSchema = z.object({
  name: defNameSchema.optional(),
  description: defDescriptionSchema.optional(),
  schema: schemaSchema.optional(),
});
