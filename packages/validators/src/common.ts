import { z } from "zod";
import { helpers } from "@tableland/sdk";
import { slugify } from "@tableland/studio-store";
import { restrictedTeamSlugs, restrictedDefSlugs } from "./restricted-slugs";
import { sqliteKeywords } from "./sqlite-keywords";

export const teamNameSchema = z
  .string()
  .trim()
  .min(3)
  .refine((name) => !restrictedTeamSlugs.includes(slugify(name)), {
    message: "You can't use a restricted word as a team name.",
  });

export const defNameSchema = z
  .string()
  .trim()
  .nonempty()
  .refine((val) => !sqliteKeywords.includes(val.toUpperCase()), {
    message: "You can't use a SQL keyword as a definition name.",
  })
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
