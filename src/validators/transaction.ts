// src/validators/transaction.ts
import { z } from "zod";

export const createTransactionSchema = z.object({
  user_id: z.number().int().positive(),
  amount: z.number().int().positive(),

  type: z.enum(["debit", "credit"]),
  status: z.enum(["active","undo","update"]).optional(),

  category_id: z.number().int().positive(),
  reason: z.string().optional(),
});

export const updateTransactionSchema = z.object({

  amount: z.number().int().positive().optional(),
  type: z.enum(["debit", "credit"]).optional(),

  category_id: z.number().int().positive().optional(),
  reason: z.string().optional(),
});

export const syncTransactionSchema = z.array(
  z.object({
    user_id: z.number().int().positive(),
    amount: z.number().int().positive(),

    type: z.enum(["debit", "credit"]),
    status: z.enum(["active", "undo","update"]).optional(),

    category: z.string().min(1),
    reason: z.string().optional(),
  })
).max(50 , "Too many transactions at once")
;
export type SyncTransaction = z.infer<typeof syncTransactionSchema>;
export type CreateTransaction = z.infer<typeof createTransactionSchema>;
export type UpdateTransaction = z.infer<typeof updateTransactionSchema>;
