CREATE TYPE "public"."statusEnum" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."txnType" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"telegramId" integer NOT NULL,
	"otp" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telegram_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"type" "txnType",
	"status" "statusEnum" DEFAULT 'active',
	"category" varchar NOT NULL,
	"reason" varchar,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_telegram_id_unique" UNIQUE("telegram_id"),
	CONSTRAINT "amount_check" CHECK ("transactions"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"telegram_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "balance_check" CHECK ("users"."balance" >= 0)
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_categories_name_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "txn_telegram_idx" ON "transactions" USING btree ("telegram_id");--> statement-breakpoint
CREATE INDEX "txn_category" ON "transactions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "txn_telegram_updated_at" ON "transactions" USING btree ("telegram_id","updated_at" DESC);--> statement-breakpoint
CREATE UNIQUE INDEX "users_telegram_idx" ON "users" USING btree ("telegram_id");