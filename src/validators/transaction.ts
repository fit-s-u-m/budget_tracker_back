// src/validators/transaction.ts
import { z } from "zod";

export const createTransactionSchema = z.object({
  telegram_id: z.number().int().positive(),
  amount: z.number().int().positive(),

  type: z.enum(["debit", "credit"]),
  status: z.enum(["active", "inactive"]).optional(),

  category: z.string().min(1),
  reason: z.string().optional(),
  created_at: z.string().optional(),
});

export const updateTransactionSchema = z.object({

  id: z.uuid(),
  amount: z.number().int().positive().optional(),
  type: z.enum(["debit", "credit"]).optional(),

  category: z.string().min(1).optional(),
  reason: z.string().optional(),
  created_at: z.string().optional(),
});

export const syncTransactionSchema = z.array(
  z.object({
    telegram_id: z.number().int().positive(),
    amount: z.number().int().positive(),

    type: z.enum(["debit", "credit"]),
    status: z.enum(["active", "inactive"]).optional(),

    category: z.string().min(1),
    reason: z.string().optional(),
    created_at: z.string().optional(),
  })
);
