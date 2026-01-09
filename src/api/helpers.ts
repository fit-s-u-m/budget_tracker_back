import { category, transaction, user } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import type { db as DB } from "@/db"; // your db type
import { createTransactionSchema, updateTransactionSchema } from "@/validators/transaction"
import { Context } from "hono"
import z from "zod"


// --------------------- update user balance helper function ---------------------
export const updateUserBalance = async (
  tx: Parameters<typeof DB.transaction>[0] extends (t: infer T) => any ? T : never,
  telegram_id: number,
  amountToAdd: number
) => {
  await tx
    .update(user)
    .set({
      balance: sql`${user.balance} + ${amountToAdd}`,
    })
    .where(eq(user.telegram_id, telegram_id));
};

// ------------------- mark transaciton undo helper  ------------------------------
export const markTransactionUndo = async (
  tx: Parameters<typeof DB.transaction>[0] extends (t: infer T) => any ? T : never,
  txn_id: string
) => {
  await tx.update(transaction).set({
    status: "inactive"
  }).where(eq(transaction.id, txn_id))
}
// ------------------------ create a new transaction helper ------------------------

export const createTransaction = async (
  tx: Parameters<typeof DB.transaction>[0] extends (t: infer T) => any ? T : never,
  transaction_validated: z.infer<typeof createTransactionSchema>,
  c: Context,
) => {


  const categoryFinded = await tx.query.category.findFirst({
    where: eq(category.name, transaction_validated.category)
  });

  if (!categoryFinded) {
    return c.json({ error: "Category not found" }, 400);
  }

  // Insert and get the new transaction id
  const [newTransaction] = await tx
    .insert(transaction)
    .values(transaction_validated)
    .returning({ id: transaction.id }); // <-- returning the id

  // newTransaction.id now contains the generated UUID
  console.log("New transaction ID:", newTransaction.id);

  // Update user balance atomically
  const amountToAdd = transaction_validated.type === 'credit'
    ? transaction_validated.amount
    : -transaction_validated.amount;

  await updateUserBalance(tx, transaction_validated.telegram_id, amountToAdd);

  return newTransaction; // you can also return it to the client
};

// ------------------------ get transaction by id ------------------------

export const getTransactionById = async (
  tx: Parameters<typeof DB.transaction>[0] extends (t: infer T) => any ? T : never,
  txn_id: string) =>
  await tx.query.transaction.findFirst({
    where: eq(transaction.id, txn_id)
  })

