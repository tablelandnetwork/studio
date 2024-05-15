import { z } from "zod";
import { teamNameSchema } from "../common.js";

export const registerSchema = z.object({
  username: teamNameSchema,
  email: z.string().trim().email().or(z.literal("")),
});
