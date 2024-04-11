import { z } from "zod";
import { slugify } from "@tableland/studio-store";
import { restrictedTeamSlugs } from "./restricted-slugs";

export const teamNameSchema = z
  .string()
  .trim()
  .min(3)
  .refine((name) => !restrictedTeamSlugs.includes(slugify(name)), {
    message: "You can't use a restricted word as a team name.",
  });
