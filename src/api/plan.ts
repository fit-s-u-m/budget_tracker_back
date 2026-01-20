import { Hono } from "hono"
import { db } from "@/db"
import { zValidator } from "@hono/zod-validator";
import { createPlan } from "@/validators/plan"
import { eq } from "drizzle-orm";
import { budgetPlan, category } from "@/db/schema"

const app = new Hono()

app.get("/", async (c) => {
  const plan = await db.query.budgetPlan.findMany()
  console.log(plan)
  return c.json(plan)
})

app.post("/", zValidator("json", createPlan), async (c) => {
  const planInput = c.req.valid("json")
  const categoryFinded = await db.query.category.findFirst({ where: eq(category.name, planInput.category) })
  if (!categoryFinded) return c.json({ error: "can not find category" })
  const plan = await db.insert(budgetPlan).values(planInput).returning()
  return c.json(plan)
})

export default app
