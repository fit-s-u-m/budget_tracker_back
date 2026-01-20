import { timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const timestamps = {
  created_at: timestamp({ mode: "date" })
    .defaultNow()
    .notNull(),

  updated_at: timestamp({ mode: "date" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
};

