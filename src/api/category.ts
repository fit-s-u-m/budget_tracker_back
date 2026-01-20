import { Hono } from "hono"
import { db } from "@/db";

const app = new Hono()

app.get("/", async (c) => {
  const categories = await db.query.category.findMany()
  return c.json(categories)
})

export default app;
