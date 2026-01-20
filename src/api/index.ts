import { Hono } from "hono"
import env from "@/env"
import { bot } from "@/telegramBot"
import { default as transactions } from "./transaction"
import { default as user } from "./user"
import { default as otp } from "./otp"
import { default as category } from "./category"
import { default as plan } from "./plan"

const app = new Hono()

app.notFound((c) => {
  return c.text('This route is not found ', 404)
})
app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('Custom Error Message', 500)
})

app.get("/", (c) => c.text("Hello from ur fav Budget tracker"))

app.route("/transactions", transactions)
app.route("/users", user)
app.route("/otp", otp)
app.route("/categories", category)
app.route("/plan", plan)

// Start telegram
bot.start();
import "@/telegramBot/start"
import "@/telegramBot/verify"

Bun.serve({
  fetch: app.fetch,
  port: env.PORT,
})

