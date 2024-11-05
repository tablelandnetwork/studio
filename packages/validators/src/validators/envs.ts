import { z } from "zod";
import { envNameSchema, newEnvSchema } from "../common.js";

export const envNameAvailableSchema = z.object({
  projectId: z.string().trim().min(1),
  name: envNameSchema,
  envId: z.string().optional(),
});

export { newEnvSchema };
