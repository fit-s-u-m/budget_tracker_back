CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"telegramId" integer NOT NULL UNIQUE,
	"amount" integer NOT NULL,
	"type" "txnType" NOT NULL,
	"status" "statusEnum" DEFAULT 'active'::"statusEnum",
	"category" varchar NOT NULL,
	"reason" varchar,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "amount_check" CHECK ("amount" > 21)
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "balance" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "txn_telegram_idx" ON "transactions" ("telegramId");--> statement-breakpoint
CREATE INDEX "txn_category" ON "transactions" ("category");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_categories_name_fkey" FOREIGN KEY ("category") REFERENCES "categories"("name");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "balance_check" CHECK ("balance" > 0);