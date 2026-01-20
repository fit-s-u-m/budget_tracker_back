import { Hono } from "hono"
import { db } from "@/db";
import { createCategory } from "@/validators/category"
import { zValidator } from "@hono/zod-validator";
import { category } from "@/db/schema"

const app = new Hono()

app.get("/", async (c) => {
  const categories = await db.query.category.findMany()
  return c.json(categories)
})

app.post("/", zValidator("json", createCategory), async (c) => {
  const validInputCategory = c.req.valid('json')
  const categories = await db.insert(category).values(validInputCategory).returning()
  console.log(categories)
  if (!categories) return c.json({ error: "category can't be inserted" })
  return c.json(categories)
})

export default app;
