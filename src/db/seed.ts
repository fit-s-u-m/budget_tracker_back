import { Table, getTableName, sql } from "drizzle-orm";
import env from '@/env';
import { db, connection } from '@/db';
import * as schema from "@/db/schema";
import * as seeds from './seeds';

if (!env.DB_SEEDING) {
  throw new Error('You must set DB_SEEDING to "true" when running seeds');
}

async function resetTable(db: db, table: Table) {
  return db.execute(
    sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`)
  );
}
async function seed() {
  for (const table of [
    schema.category,
    schema.user,
    schema.transaction,
    schema.otps,
  ]) {
    await resetTable(db, table);
  }

  await seeds.categories(db);

  await connection.end();

}
seed()
