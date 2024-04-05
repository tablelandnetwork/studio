import { z } from "zod";
import { helpers } from "@tableland/sdk";
import { type Schema, slugify } from "@tableland/studio-store";
import { sqliteKeywords } from "../sqlite-keywords";
import { restrictedTableSlugs } from "../restricted-slugs";

const tableNameSchema = z
  .string()
  .trim()
  .nonempty()
  .refine((val) => !sqliteKeywords.includes(val.toUpperCase()), {
    message: "You can't use a SQL keyword as a table name.",
  })
  .refine((val) => !restrictedTableSlugs.includes(slugify(val)), {
    message: "You can't use a restricted word as a table name.",
  })
  .refine(
    async (val) => {
      try {
        await helpers.validateTableName(`${val}_1_1`, true);
        return true;
      } catch (_) {
        return false;
      }
    },
    { message: "Table name is invalid." },
  );

const columnNameSchema = z
  .string()
  .trim()
  .nonempty()
  .regex(
    /^(?!\d)[a-z0-9_]+$/,
    "Column name can't start with a number and can contain any combination of lowercase letters, numbers, and underscores.",
  )
  .refine((val) => !sqliteKeywords.includes(val.toUpperCase()), {
    message: "You can't use a SQL keyword as a column name.",
  });

export const tableNameAvailableSchema = z.object({
  projectId: z.string().trim(),
  name: tableNameSchema,
});

export const newTableFormSchema = z.object({
  name: tableNameSchema,
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
    .max(24, "A table can have at most 24 columns."),
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
    .max(24, "A table can have at most 24 columns."),
  tableConstraints: z.array(z.string().trim().nonempty()).optional(),
});

export const newTableApiSchema = z.object({
  name: tableNameSchema,
  description: z.string().trim().nonempty().max(1024),
  schema: schemaSchema,
});

export const importTableSchema = z.object({
  chainId: z.coerce.number().gt(0),
  tableId: z.string().trim().nonempty(),
  name: tableNameSchema,
  description: z.string().trim().nonempty(),
  environmentId: z.string().trim(),
});
