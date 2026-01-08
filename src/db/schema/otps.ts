import { pgTable, integer, timestamp } from "drizzle-orm/pg-core"

const otpCodesTable = pgTable("otp_codes", {
  telegramId: integer().notNull(),
  otp: integer().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  expiresAt: timestamp().notNull(),
})

export default otpCodesTable
