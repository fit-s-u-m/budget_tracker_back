import { Hono } from "hono"
import env from "@/env"

const app = new Hono()

app.notFound((c) => {
  return c.text('This route is not found ', 404)
})
app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('Custom Error Message', 500)
})

app.get("/", (c) => c.text("Hello from ur fav Budget tracker"))

Bun.serve({
  fetch: app.fetch,
  port: env.PORT,
})
