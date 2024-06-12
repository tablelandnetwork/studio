import { z } from "zod";
import { defNameSchema } from "../common.js";

export const importTableSchema = z.object({
  chainId: z.coerce.number().gt(0),
  tableId: z.string().trim().min(1),
  def: z
    .object({
      name: defNameSchema,
      description: z.string().trim().min(1),
    })
    .or(z.string().uuid()),
  environmentId: z.string().trim(),
});
