import { z } from "zod";
import { teamNameSchema } from "../common";

export const registerSchema = z.object({
  username: teamNameSchema,
  email: z.string().trim().email().optional(),
});
