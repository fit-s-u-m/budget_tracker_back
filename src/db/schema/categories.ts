import { integer, uuid, pgTable, varchar } from "drizzle-orm/pg-core";
const categories = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull().unique(),
})
export default categories;
