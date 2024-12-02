ALTER TABLE "variants" ADD COLUMN "cost_price" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "variants" ADD COLUMN "msp" integer;--> statement-breakpoint
ALTER TABLE "variants" ADD COLUMN "description" text;