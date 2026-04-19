CREATE TYPE "public"."charge_status" AS ENUM('pending', 'processing', 'succeeded', 'failed');--> statement-breakpoint
CREATE TABLE "charges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'BRL' NOT NULL,
	"description" text,
	"status" charge_status DEFAULT 'pending' NOT NULL,
	"idempotency_key" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "charges_idempotency_key_unique" UNIQUE("idempotency_key")
);
