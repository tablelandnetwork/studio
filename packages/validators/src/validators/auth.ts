import { z } from "zod";
import { orgNameSchema } from "../common.js";

export const registerSchema = z.object({
  username: orgNameSchema,
  email: z.string().trim().email().or(z.literal("")),
});
