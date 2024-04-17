import { z } from "zod";
import { teamNameSchema } from "../common";

export const teamNameAvailableSchema = z.object({
  name: teamNameSchema,
});

export const newTeamSchema = z.object({
  name: teamNameSchema,
  emailInvites: z.array(z.string().trim().email()),
});

export const updateTeamSchema = z.object({ name: teamNameSchema });
