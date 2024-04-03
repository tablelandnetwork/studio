import { z } from "zod";
import { slugify } from "@tableland/studio-store";
import { restrictedTeamSlugs } from "../restricted-slugs";

const teamNameSchema = z
  .string()
  .trim()
  .min(3)
  .refine((name) => !restrictedTeamSlugs.includes(slugify(name)), {
    message: "You can't use a restricted word as a team name.",
  });

export const teamNameAvailableSchema = z.object({
  name: teamNameSchema,
});

export const newTeamSchema = z.object({
  name: teamNameSchema,
  emailInvites: z.array(z.string().trim().email()),
});
