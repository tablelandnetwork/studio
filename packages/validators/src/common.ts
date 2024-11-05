import { z } from "zod";
import { helpers } from "@tableland/sdk";
import { restrictedOrgSlugs, restrictedDefSlugs } from "./restricted-slugs.js";

export const makeSlugString = () =>
  z
    .string()
    .trim()
    .regex(
      /^[a-z0-9-_]+$/,
      "Only lowercase letters, numbers, dashes, and underscores are allowed.",
    );

export const orgNameSchema = makeSlugString()
  .min(3)
  .refine((name) => !restrictedOrgSlugs.includes(name), {
    message: "You can't use a restricted word as a org name.",
  });

export const defNameSchema = makeSlugString()
  .min(1)
  .refine((val) => !restrictedDefSlugs.includes(val), {
    message: "You can't use a restricted word as a definition name.",
  })
  .refine(
    async (val) => {
      try {
        await helpers.validateTableName(`${val}_1_1`, true);
        return true;
      } catch (_) {
        return false;
      }
    },
    { message: "Definition name is invalid." },
  );

export const envNameSchema = makeSlugString()
  .min(1)
  .refine((val) => !restrictedDefSlugs.includes(val), {
    message: "You can't use a restricted word as an environment name.",
  });

export const newEnvSchema = z.object({
  name: envNameSchema,
});
