import { sql } from "drizzle-orm";
import { integer, uuid, pgTable, varchar, pgEnum, index, uniqueIndex, check } from "drizzle-orm/pg-core";
import { timestamps } from "./util";
import { txnType, statusEnum } from "./enums";

import categories from './categories';
import user from "./users";

const transactionsTable = pgTable("transactions", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: integer().notNull().references(()=>user.id),
  amount: integer().notNull(),
  type: txnType("type"),
  status: statusEnum("status").default("active"),
  category_id: integer().notNull().references(() => categories.id),
  reason: varchar(),
  ...timestamps,
},
  (table) => [
    index("txn_user_idx").on(table.user_id),
    index("txn_category").on(table.category_id),
    index("txn_user_updated_at").on(table.user_id, sql`${table.updated_at} DESC`),
    check("amount_check", sql`${table.amount} > 0`)
  ]
);
export default transactionsTable;
