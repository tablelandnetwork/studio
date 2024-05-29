import { z } from "zod";
import { teamNameSchema } from "../common.js";

export const teamNameAvailableSchema = z.object({
  teamId: z.string().trim().min(1).optional(),
  name: teamNameSchema,
});

export const newTeamSchema = z.object({
  name: teamNameSchema,
  emailInvites: z.array(z.string().trim().email()),
});

export const updateTeamSchema = z.object({ name: teamNameSchema });
