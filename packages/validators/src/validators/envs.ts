import { z } from "zod";

export const envNameSchema = z.object({ name: z.string().trim().min(1) });
