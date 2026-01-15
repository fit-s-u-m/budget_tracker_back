import { pgTable, integer, timestamp } from "drizzle-orm/pg-core"

const otpCodesTable = pgTable("otp_codes", {
  user_id: integer().notNull(),
  otp: integer().notNull(),
  created_at: timestamp({mode:"string"}).defaultNow().notNull(),
  expires_at: timestamp({mode:"string"}).notNull(),
})

export default otpCodesTable
