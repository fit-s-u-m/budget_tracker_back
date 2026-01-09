import { relations } from 'drizzle-orm';
import { default as user } from './users';
import { default as transactions } from './transactions';
import categories from './categories';

export const transactions_relations = relations(transactions, ({ one }) =>
({
  user: one(user, {
    fields: [transactions.telegram_id],
    references: [user.telegram_id]
  }),
  category: one(categories, {
    fields: [transactions.category_id],
    references: [categories.id]
  })

})
)
