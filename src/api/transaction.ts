import { Hono } from "hono"
import { eq, count, gte, lt, ilike, and } from "drizzle-orm"
import { db } from "@/db"; // your db type
import { transaction, user, category } from "@/db/schema"
import { CreateTransaction, createTransactionSchema, syncTransactionSchema, updateTransactionSchema } from "@/validators/transaction"
import { zValidator } from "@hono/zod-validator";
import { createTransaction, getTransactionById, markTransactionUndo, updateTransaction } from "@/helpers/transaction";


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
      await createTransaction(tx, transactionValidated)
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
    console.log("Received offline transactions for sync:", offLineTransactions)


    // SET key value NX EX 30

    await db.transaction(async (tx) => {
      console.log("Fetching categories for sync...")
      const categories = await tx.query.category.findMany()
      console.log("Fetched categories:", categories)
      const categoryMap = new Map(
        categories.map(cat => [cat.name, cat.id])
      )
      console.log("Syncing offline transactions:", offLineTransactions)
      console.log("Category Map:", categoryMap)

      for (const transaction of offLineTransactions) {
        const categoryId = categoryMap.get(transaction.category)

        if (!categoryId) {
          throw new Error(`Category ${transaction.category} not found`)
        }
        await createTransaction(
          tx,
          { ...transaction, category_id: categoryId }
        )
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
    const oldTransaction = await db.query.transaction.findFirst({ where: eq(transaction.id, id) })

    if (!oldTransaction) {
      throw new Error("Transaction not found")
    }
    const amountChanged = transactionValidated.amount !== undefined && transactionValidated.amount !== oldTransaction.amount
    const typeChanged = transactionValidated.type !== undefined && transactionValidated.type !== oldTransaction.type
    const reasonChanged = transactionValidated.reason !== undefined && transactionValidated.reason !== oldTransaction.reason
    const categoryChanged = transactionValidated.category_id !== undefined && transactionValidated.category_id !== oldTransaction.category_id

    if (!amountChanged && !typeChanged && !reasonChanged && !categoryChanged) {
      return c.json({ message: "No changes to update" }, 200)
    }
    await db.transaction(async (tx) => {
      updateTransaction(tx, transactionValidated, oldTransaction as CreateTransaction, id)

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
      const undoTransaction = await createTransaction(tx, transactionValidated)

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
  const { limit, offset, user_id } = c.req.query()
  try {

    const limitInt = Number(limit)
    const offsetInt = Number(offset)
    const userId = Number(user_id)

    if (!userId) {
      return c.json({ error: "You must provide userId" }, 400);
    }
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
      where: eq(transaction.user_id, userId),
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
app.get("count/:user_id", async (c) => {
  try {
    const { user_id } = c.req.param()
    const user_id_int = parseInt(user_id)

    const counts = await db.select({ count: count() })
      .from(transaction)
      .where(eq(transaction.user_id, user_id_int))

    return c.json(counts, 200)
  } catch (error) {

  }
})

app.get("/search", async (c) => {
  try {
    const {
      telegram_id,
      category_name,
      created_at,
      text,
      limit = "20",
      offset = "0",
    } = c.req.query()

    if (!telegram_id) {
      return c.json({ error: "telegram_id is required" }, 400)
    }

    // 1️⃣ find user
    const foundUser = await db.query.user.findFirst({
      where: eq(user.telegram_id, Number(telegram_id)),
    })

    if (!foundUser) {
      return c.json([], 200)
    }

    // 2️⃣ build filters dynamically
    const filters = [eq(transaction.user_id, foundUser.id)]

    if (category_name) {
      const foundCategory = await db.query.category.findFirst({
        where: eq(category.name, category.name),
      })
      if (foundCategory)
        filters.push(eq(transaction.category_id, foundCategory.id))
    }

    if (text) {
      filters.push(ilike(transaction.reason, `%${text}%`))
    }

    if (created_at) {
      // date-only search (whole day)
      const start = new Date(created_at)
      const end = new Date(created_at)
      end.setDate(end.getDate() + 1)

      filters.push(
        gte(transaction.created_at, start),
        lt(transaction.created_at, end),
      )
    }

    // 3️⃣ query
    const results = await db
      .select()
      .from(transaction)
      .where(and(...filters))
      .limit(Number(limit))
      .offset(Number(offset))
      .orderBy(transaction.created_at)

    return c.json(results, 200)
  } catch (err) {
    console.error(err)
    return c.json({ error: "Internal server error" }, 500)
  }
})
export default app

