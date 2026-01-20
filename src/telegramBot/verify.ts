import { bold, code, format, link, InlineKeyboard } from "gramio"
import { bot } from "./index"
import env from '@/env'
import { generateOTP } from "@/helpers/otp"
import { getPrevUser } from "@/helpers/user"

bot.command("generateOTP", async (context) => {
  console.log("generateOTP  command received")
  const telegramId = context.from.id
  const expireTime = 10;


  const user = await getPrevUser(telegramId)
  if (!user) return context.send("please registor with /start")
  const otp = await generateOTP(user.name, expireTime)

  context.send(format
    `
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
