import { z } from "zod";

export const createUserSchema = z.object({
  telegram_id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.email().optional(),
});
