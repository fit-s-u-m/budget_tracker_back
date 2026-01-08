import { sql } from "drizzle-orm"
import { integer, pgTable, varchar, timestamp, check } from "drizzle-orm/pg-core";

const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  telegramId: integer().unique().notNull(),
  name: varchar().notNull(),
  email: varchar().unique(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  balance: integer().notNull().default(0),
}, (table) => [
  check("balance_check", sql`${table.balance} > 0`)
]
);
export default usersTable;
