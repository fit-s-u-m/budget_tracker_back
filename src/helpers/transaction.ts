import { category, transaction, user,transactionUpdateLogs, otps } from "@/db/schema"
import { eq } from "drizzle-orm"
import type { db as DB } from "@/db"; // your db type
import type { CreateTransaction,UpdateTransaction } from "@/validators/transaction"
import {updateUserBalance} from "@/helpers/user"
type DrizzleTx = Parameters<typeof DB.transaction>[0] extends (t: infer T) => any ? T : never;

// ------------------- mark transaciton undo helper  ------------------------------
export const markTransactionUndo = async (
  tx: DrizzleTx,
  txn_id: string
) => {
  await tx.update(transaction).set({
    status: "undo"
  }).where(eq(transaction.id, txn_id))
}
// ------------------------ create a new transaction helper ------------------------
export const createTransaction = async (
  tx:DrizzleTx,
  transaction_validated: CreateTransaction,
) => {
  const categoryFinded = await tx.query.category.findFirst({
    where: eq(category.id, transaction_validated.category_id)
  });
  const userFinded = await tx.query.user.findFirst({
    where: eq(user.id, transaction_validated.user_id)
  })
  console.log("categoryFinded:", categoryFinded);
  console.log("userFinded:", userFinded);

  if (!categoryFinded) {
    throw new Error(`Category '${transaction_validated.category_id}' does not exist.`);
  }
  if (!userFinded) {
    throw new Error(`User with user_id '${transaction_validated.user_id}' does not exist.`);
  }

  // Insert and get the new transaction id
  const [newTransaction] = await tx
    .insert(transaction)
    .values({
      ...transaction_validated,
        category_id: categoryFinded.id,
    })
    .returning({ id: transaction.id }); // <-- returning the id

  // newTransaction.id now contains the generated UUID
  console.log("New transaction ID:", newTransaction.id);

  // Update user balance atomically
  const amountToAdd = transaction_validated.type === 'credit'
    ? transaction_validated.amount
    : -transaction_validated.amount;

  await updateUserBalance(tx, transaction_validated.user_id, amountToAdd);

  return newTransaction; // you can also return it to the client
};


// ------------------------ update transations  ------------------------
export const updateTransaction = async (
  tx: DrizzleTx,
  transactionValidated: UpdateTransaction,
  oldTransaction: CreateTransaction,
  id: string,
) => {
      if ( transactionValidated.amount !== undefined || transactionValidated.type !== undefined) {
        const signed = (amount: number, type: "credit" | "debit" | null) =>
          type === "credit" ? amount : -amount

        const oldSigned = signed(oldTransaction.amount, oldTransaction.type)

        const newAmount =
          transactionValidated.amount ?? oldTransaction.amount

        const newType =
          transactionValidated.type ?? oldTransaction.type

        const newSigned = signed(newAmount, newType)

        const budgetDiff = newSigned - oldSigned

        if (budgetDiff !== 0) {
          await updateUserBalance(tx, oldTransaction.user_id, budgetDiff)
        }
      }
      await tx.update(transaction).set({
          amount: transactionValidated.amount ?? oldTransaction.amount,
          type: transactionValidated.type ?? oldTransaction.type,
          reason: transactionValidated.reason ?? oldTransaction.reason,
          category_id: transactionValidated.category_id ?? oldTransaction.category_id,
        }).where(eq(transaction.id, id))
      await tx.insert(transactionUpdateLogs).values({
            transaction_id: id,
            amount_change: transactionValidated.amount !== undefined 
            ? `${oldTransaction.amount} -> ${transactionValidated.amount}` 
            : "no change",
            type_before: oldTransaction.type,
      })
}


// ------------------------ get transaction by id ------------------------

export const getTransactionById = async (
  tx: Parameters<typeof DB.transaction>[0] extends (t: infer T) => any ? T : never,
  txn_id: string) =>
  await tx.query.transaction.findFirst({
    where: eq(transaction.id, txn_id)
  })


