import { user } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import type { db as DB } from "@/db"; // your db type
import { db } from "@/db";

type DrizzleTx = Parameters<typeof DB.transaction>[0] extends (t: infer T) => any ? T : never;

// --------------------- update user balance helper function ---------------------
export const updateUserBalance = async (
  tx: DrizzleTx,
  user_id: number,
  amountToAdd: number
) => {
  const currentUser = await tx.query.user.findFirst({ where: eq(user.id, user_id) }); // ensure user exists
  if (!currentUser) throw new Error("User not found");
  if (currentUser.balance + amountToAdd < 0) throw new Error("Insufficient balance");
  await tx
    .update(user)
    .set({
      balance: sql`${user.balance} + ${amountToAdd}`,
    })
    .where(eq(user.id, user_id));
};

// --------------------- createUser ---------------------

export const createOrReturnPrevUser = async (
  telegram_id: number,
  name: string,
) => {
  const prevUser = await db.query.user.findFirst({ where: eq(user.telegram_id, telegram_id) })
  if (prevUser) return { user: prevUser, type: "old" }

  const createdUser = await db.insert(user).values({
    telegram_id,
    name,
  }).returning();
  return { user: createdUser[0], type: "new" };
}

export const getPrevUser = async (
  telegram_id: number,
) => {
  const prevUser = await db.query.user.findFirst({ where: eq(user.telegram_id, telegram_id) })
  return prevUser
} 
