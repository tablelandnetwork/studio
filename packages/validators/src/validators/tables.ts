import { z } from "zod";
import { defNameSchema } from "../common.js";

export const importTableSchema = z.object({
  chainId: z.coerce.number().gt(0),
  tableId: z.string().trim().min(1),
  defName: defNameSchema,
  defDescription: z.string().trim().min(1),
  environmentId: z.string().trim(),
});
