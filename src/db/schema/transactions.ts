import { sql } from "drizzle-orm";
import { integer, uuid, pgTable, varchar, pgEnum, index, uniqueIndex, check } from "drizzle-orm/pg-core";
import { timestamps } from "./util";
import { txnType, statusEnum } from "./enums";

import categories from './categories';

const transactionsTable = pgTable("transactions", {
  id: uuid().primaryKey().defaultRandom(),
  telegram_id: integer().unique().notNull(),
  amount: integer().notNull(),
  type: txnType("type"),
  status: statusEnum("status").default("active"),
  category: varchar().notNull().references(() => categories.name),
  reason: varchar(),
  ...timestamps,
},
  (table) => [
    index("txn_telegram_idx").on(table.telegram_id),
    index("txn_category").on(table.category),
    index("txn_telegram_updated_at").on(table.telegram_id, sql`${table.updated_at} DESC`),
    check("amount_check", sql`${table.amount} > 0`)
  ]
);
export default transactionsTable;
