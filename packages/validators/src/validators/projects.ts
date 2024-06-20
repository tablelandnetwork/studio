import { z } from "zod";
import { slugify } from "@tableland/studio-store";
import { restrictedProjectSlugs } from "../restricted-slugs.js";
import { envNameSchema } from "../common.js";

const projectNameSchema = z
  .string()
  .trim()
  .min(3)
  .refine((name) => !restrictedProjectSlugs.includes(slugify(name)), {
    message: "You can't use a restricted word as a project name.",
  });

const projectDescriptionSchema = z.string().trim().min(1).max(1024);

export const projectNameAvailableSchema = z.object({
  teamId: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
  name: projectNameSchema,
});

export const newProjectSchema = z.object({
  name: projectNameSchema,
  description: projectDescriptionSchema,
  envNames: z
    .array(envNameSchema)
    .min(1)
    .refine((names) => {
      return new Set(names.map((val) => val.name)).size === names.length;
    }, "Environment names must be unique."),
});

export const updateProjectSchema = z.object({
  name: projectNameSchema.optional(),
  description: projectDescriptionSchema.optional(),
});
