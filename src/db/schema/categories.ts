import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
const categories = pgTable("categories", { // TODO: add user_id for categories
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull().unique(),
})
export default categories;
