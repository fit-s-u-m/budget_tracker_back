import { pgEnum } from "drizzle-orm/pg-core";

export const txnType = pgEnum("txnType", ["debit", "credit"]);
export const statusEnum = pgEnum("statusEnum", ["active","undo","update"]);
