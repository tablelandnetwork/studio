import { z } from "zod";
import { slugify } from "@tableland/studio-store";
import { restrictedProjectSlugs } from "../restricted-slugs";

const projectNameSchema = z
  .string()
  .trim()
  .min(3)
  .refine((name) => !restrictedProjectSlugs.includes(slugify(name)), {
    message: "You can't use a restricted word as a project name.",
  });

export const projectNameAvailableSchema = z.object({
  teamId: z.string().trim().optional(),
  name: projectNameSchema,
});

export const newProjectSchema = z.object({
  name: projectNameSchema,
  description: z.string().trim().nonempty().max(1024),
});
