import { z } from "zod";

export const verifyOtp = z.object({
  otp: z.number().int().positive().min(100000).max(999999),
});
