import { bold, code, format, link, InlineKeyboard } from "gramio"
import { bot } from "./index"
import env from '@/env'
import { generateOTP } from "@/helpers/otp"
import { createOrReturnPrevUser } from "@/helpers/user"

bot.command("start", async (context) => {
  console.log("Start command received")
  const telegramId = context.from.id

  const userName = context.from.username ?? ""

  const expireTime = 10;

  const result = await createOrReturnPrevUser(telegramId, userName)
  const user = result.user
  if (result.type === "old") { return context.send("You are already registered ! Use /help to see available commands.") }
  const otp = await generateOTP(user.name, expireTime)

  context.send(format
    `
          Successfully registered ! Welcome to the Budget Bot.

          Your OTP: ${code` ${otp}`}
          It will expire in ${bold` ${expireTime}`} minutes.

          Use the otp to login to our website at
         ${link("Budget Tracker", env.FRONTEND_URL)}`
  )
  new InlineKeyboard().copy(
    "Copy me",
    `${otp}`
  );
})
