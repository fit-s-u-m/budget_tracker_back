import { pgTable, integer, timestamp, varchar, uuid } from "drizzle-orm/pg-core"
import {txnType} from "./enums"
import transactions from "./transactions"

const transactionUpdateLogs = pgTable("transaction_update_logs", {
  transaction_id: uuid().notNull().references(()=>transactions.id),
  amount_change: varchar(),
  type_before: txnType("type"),
  created_at: timestamp().defaultNow().notNull(),
})

export default transactionUpdateLogs
