import { Hono } from "hono"
import { eq } from "drizzle-orm"
import { db } from "@/db"; // your db type
import { transaction } from "@/db/schema"
import { createTransactionSchema, syncTransactionSchema, updateTransactionSchema } from "@/validators/transaction"
import { zValidator } from "@hono/zod-validator";
import { createTransaction, updateUserBalance, getTransactionById, markTransactionUndo } from "./helpers"


const app = new Hono()

// ------------------------ create a new transaction ------------------------
app.post("/", zValidator("json", createTransactionSchema), async (c) => {
  try {
    const transactionValidated = c.req.valid('json')
    if (!transactionValidated) {
      return c.json({ error: "Invalid transaction data" }, 400);
    }
    console.log("Creating transaction:", transactionValidated)

    await db.transaction(async (tx) => {
      await createTransaction(tx, transactionValidated, c)
    })
    return c.json({ message: "Transaction created successfully" }, 201);

  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
})

// ------------------------ sync offline transaction ------------------------

app.post("/sync", zValidator("json", syncTransactionSchema), async (c) => {
  try {
    const offLineTransactions = c.req.valid('json')

    await db.transaction(async (tx) => {
      for (const transactionValidated of offLineTransactions) {
        await createTransaction(tx, transactionValidated, c)
      }
    })
    return c.json({ message: "Transactions synced successfully" }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
})


// ------------------------ update a new transaction ------------------------
app.patch("/:id", zValidator("json", updateTransactionSchema), async (c) => {
  try {
    const transactionValidated = c.req.valid('json')
    const id = c.req.param("id")

    console.log("Updating transaction id:", id)
    await db.transaction(async (tx) => {

      if (
        transactionValidated.amount !== undefined || 
        transactionValidated.type !== undefined) {

        const oldTransaction =  await tx.query.transaction.findFirst({ where: eq(transaction.id,id) })

        if (!oldTransaction) {
          throw new Error("Transaction not found")
        }

        if (transactionValidated.amount !== undefined && !transactionValidated.type && oldTransaction) { // only amount is updated

          const amountToAdd =  transactionValidated.amount - oldTransaction?.amount 
          console.log("Amount to add:", amountToAdd)
          await updateUserBalance(tx, oldTransaction.telegram_id, amountToAdd)
        }
        else if (transactionValidated.amount == undefined // only type is updated
          && transactionValidated.type
          && oldTransaction
          && transactionValidated.type != oldTransaction.type) {

          const amountToAdd = transactionValidated.type == "credit"
            ? 2 * oldTransaction.amount
            : - 2 * oldTransaction.amount
          await updateUserBalance(tx, oldTransaction.telegram_id, amountToAdd)
        }
        else if (transactionValidated.amount !==undefined // both amount and type are updated
          && transactionValidated.type
          && oldTransaction
          && transactionValidated.type != oldTransaction.type) {

          const amountToRemove = oldTransaction.type == "credit"
            ? - oldTransaction.amount
            : oldTransaction.amount

          const amountToAdd = transactionValidated.type == "credit" ? transactionValidated.amount : - transactionValidated.amount
          await updateUserBalance(tx, oldTransaction.telegram_id, amountToAdd + amountToRemove)
        }

      }

      // update transaction
     const teacher =  await tx.update(transaction).set({
        ...transactionValidated
      }).where(eq(transaction.id, id))
      console.log(teacher)

    })
    return c.json({ message: "Transaction updated successfully" }, 200);

  } catch (error) {

    return c.json({ error: (error as Error).message }, 400);
  }

})

// ------------------------  Undo Transactions  ------------------------
app.delete("/:id", async (c) => {
  try {
    const { id } = c.req.param()
    await db.transaction(async (tx) => {

      const transaction = await getTransactionById(tx, id)
      if (!transaction) { return c.json({ error: "Transaction not found" }, 404); }

      const transaction_undo = {
        ...transaction, // copy all fields
        type: transaction.type === "credit" ? "debit" : "credit", // flip type
      };

      const transactionValidated = createTransactionSchema.parse(transaction_undo)
      const undoTransaction = await createTransaction(tx, transactionValidated, c)

      if ("id" in undoTransaction) {
        await markTransactionUndo(tx, undoTransaction.id)
        await markTransactionUndo(tx, id)
      } else {
        return c.json({ error: "Failed to create undo transaction" }, 500);
      }
    })

    return c.json({ message: "Transaction undone successfully" }, 200);

  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }

})

// ------------------------ Fetch Transactions with limit & offset ------------------------
app.get("/", async (c) => {
  const userAgent = c.req.header('User-Agent')
  console.log('User-Agent:', userAgent)
  const { limit, offset } = c.req.query()
  try {

    const limitInt = Number(limit)
    const offsetInt = Number(offset)

    // handle if limit is not a positive integer
    if (!Number.isInteger(limitInt) || limitInt <= 0) {
      return c.json({ error: "Limit must be a positive integer" }, 400);
    }
    if (!Number.isInteger(offsetInt) || offsetInt < 0) {
      return c.json({ error: "Offset must be a positive integer" }, 400);
    }

    // get transactions from the database with user and category relations
    const transactions = await db.query.transaction.findMany({
      limit: limitInt,
      offset: offsetInt,
      with: { user: true, category: true }
    })
    c.status(200)
    return c.json(transactions, 200);

  } catch (error) {
    c.status(400)
    return c.json({ error: (error as Error).message })
  }
})

// ------------------------ Fetch Transactions by id ------------------------
app.get("/:id", async (c) => {
  const userAgent = c.req.header('User-Agent')
  console.log('User-Agent:', userAgent)
  const { id } = c.req.param()
  try {
    await db.transaction(async (tx) => {
      const transaction = getTransactionById(tx, id)
      console.log("getTransactionById", transaction)
      c.status(200)
      return c.json(transaction, 200);
    })

  } catch (error) {
    c.status(400)
    return c.json({ error: (error as Error).message })
  }
})

export default app
