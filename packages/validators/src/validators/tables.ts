import { z } from "zod";
import { defNameSchema } from "../common";

export const importTableSchema = z.object({
  chainId: z.coerce.number().gt(0),
  tableId: z.string().trim().nonempty(),
  defName: defNameSchema,
  defDescription: z.string().trim().nonempty(),
  environmentId: z.string().trim(),
});
