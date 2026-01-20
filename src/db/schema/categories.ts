import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { user } from "@/db/schema"
import { uniqueIndex } from "drizzle-orm/pg-core";

const categories = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull().unique(),
  userId: integer()
    .references(() => user.id, { onDelete: "cascade" })
},
  (table) => [
    uniqueIndex("categories_user_name_unique")
      .on(table.userId, table.name),
  ]
)
export default categories;
