import { z } from "zod";
import { helpers } from "@tableland/sdk";
import { slugify } from "@tableland/studio-store";
import { restrictedOrgSlugs, restrictedDefSlugs } from "./restricted-slugs.js";

export const orgNameSchema = z
  .string()
  .trim()
  .min(3)
  .refine((name) => !restrictedOrgSlugs.includes(slugify(name)), {
    message: "You can't use a restricted word as a org name.",
  });

export const defNameSchema = z
  .string()
  .trim()
  .min(1)
  .refine((val) => !restrictedDefSlugs.includes(slugify(val)), {
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

export const envNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .refine((val) => !restrictedDefSlugs.includes(slugify(val)), {
      message: "You can't use a restricted word as an environment name.",
    }),
});
