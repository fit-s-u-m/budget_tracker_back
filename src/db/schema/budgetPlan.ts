import { sql } from "drizzle-orm";
import { integer, pgTable, varchar, serial, check, uniqueIndex } from "drizzle-orm/pg-core";
import categories from "./categories";
import users from "./users";
import { timestamps } from "./util";

const budgetPlanTable = pgTable("budget_plans", {
  id: serial().primaryKey(),
  user_id: integer().references(() => users.id),

  category: varchar()
    .notNull()
    .references(() => categories.name),

  limit: integer().notNull(),

  month: integer().notNull(),
  year: integer().notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex("budget_plan_unique")
    .on(table.category, table.month, table.year),

  // validations
  check("month_check", sql`${table.month} BETWEEN 1 AND 12`),
  check("limit_positive", sql`${table.limit} > 0`),
  check(
    "year_not_past",
    sql`${table.year} >= EXTRACT(YEAR FROM CURRENT_DATE)`
  ),
]
)

export default budgetPlanTable;
