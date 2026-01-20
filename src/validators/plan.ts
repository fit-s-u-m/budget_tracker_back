import { z } from "zod";

export const createPlan = z.object({
  year: z.number(),
  month: z.number(),
  limit: z.number().positive(),
  category: z.string()
});
