import { defineRelations } from 'drizzle-orm';
import { default as users } from './users';
import { default as transactions } from './transactions';

export const transaction_to_user = defineRelations({ users, transactions }, (r) => ({
  users: {
    transactions: r.many.transactions({
      from: r.users.telegramId,
      to: r.transactions.telegramId,
    })
  }
}))

