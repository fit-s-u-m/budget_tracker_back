CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"telegramId" integer NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_telegramId_unique" UNIQUE("telegramId"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
