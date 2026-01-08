CREATE TABLE "budget_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar NOT NULL,
	"limit" integer NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "month_check" CHECK ("budget_plans"."month" BETWEEN 1 AND 12),
	CONSTRAINT "limit_positive" CHECK ("budget_plans"."limit" > 0),
	CONSTRAINT "year_not_past" CHECK ("budget_plans"."year" >= EXTRACT(YEAR FROM CURRENT_DATE))
);
--> statement-breakpoint
ALTER TABLE "budget_plans" ADD CONSTRAINT "budget_plans_category_categories_name_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "budget_plan_unique" ON "budget_plans" USING btree ("category","month","year");