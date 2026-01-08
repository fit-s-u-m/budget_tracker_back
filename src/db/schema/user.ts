import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  telegramId: integer().unique().notNull(),
  name: varchar().notNull(),
  email: varchar().unique(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),

});
export default usersTable;
