import { bold,code, format,link, InlineKeyboard} from "gramio"
import {bot} from "./index"
import env from '@/env'
import {generateOTP} from "@/helpers/otp"
import { createUser } from "@/helpers/user"

bot.command("start",async (context)=>{
  console.log("Start command received")
  const telegramId = context.from.id
  const firstName = context.from.firstName
  const expireTime = 10;

  const user = await createUser(telegramId, firstName)
  if(user.length === 0){return context.send("You are already registered ! Use /help to see available commands.")}
  const otp = await generateOTP(user[0].id,expireTime)

   context.send( format
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
