import { timestamp } from 'drizzle-orm/pg-core';

export const timestamps = {
  updated_at: timestamp({ mode: "string" }).defaultNow().notNull(),
  created_at: timestamp({ mode: "string" }).defaultNow().notNull(),
}
