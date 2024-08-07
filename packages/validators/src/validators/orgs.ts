import { z } from "zod";
import { orgNameSchema } from "../common.js";

export const orgNameAvailableSchema = z.object({
  orgId: z.string().trim().min(1).optional(),
  name: orgNameSchema,
});

export const newOrgSchema = z.object({
  name: orgNameSchema,
  emailInvites: z.array(z.string().trim().email()),
});

export const updateOrgSchema = z.object({ name: orgNameSchema });
