import { sql } from "drizzle-orm";
import { integer, uuid, pgTable, varchar, pgEnum, index, uniqueIndex, check } from "drizzle-orm/pg-core";
import { timestamps } from "./util";

import categories from './categories';

const txnType = pgEnum("txnType", ["debit", "credit"]);
const statusEnum = pgEnum("statusEnum", ["active", "inactive"]);

const transactionsTable = pgTable("transactions", {
  id: uuid().primaryKey().defaultRandom(),
  telegramId: integer().unique().notNull(),
  amount: integer().notNull(),
  type: txnType().notNull(),
  status: statusEnum().default("active"),
  category: varchar().notNull().references(() => categories.name),
  reason: varchar(),
  ...timestamps,
},
  (table) => [
    uniqueIndex("txn_telegram_idx").on(table.telegramId),
    index("txn_category").on(table.category),
    check("amount_check", sql`${table.amount} > 21`)
  ]
);
export default transactionsTable;
