import { Bot } from "gramio";
import env from "@/env"
export const bot = new Bot(env.TELEGRAM_BOT_TOKEN)
