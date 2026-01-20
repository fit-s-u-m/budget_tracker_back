import { Hono } from "hono"
import { db } from "@/db";
import { createCategory } from "@/validators/category"
import { zValidator } from "@hono/zod-validator";
import { category } from "@/db/schema"
import { eq } from "drizzle-orm";

const app = new Hono()

app.get("/", async (c) => {
  const categories = await db.query.category.findMany()
  return c.json(categories)
})

app.get("/:category_name", async (c) => {
  const { category_name } = c.req.param()
  const categoryFinded = await db.query.category.findFirst({ where: eq(category.name, category_name) })
  if (!categoryFinded) return c.json({ error: `can not find category with nam: ${category_name}` }, 400)
  return c.json({ id: categoryFinded.id }, 200)
})

app.post("/", zValidator("json", createCategory), async (c) => {
  const validInputCategory = c.req.valid('json')
  const categories = await db.insert(category).values(validInputCategory).returning()
  console.log(categories)
  if (!categories) return c.json({ error: "category can't be inserted" })
  return c.json(categories)
})

export default app;
