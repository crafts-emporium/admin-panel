ALTER TABLE "purchase_items" ADD COLUMN "cost_price" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD COLUMN "discounted_price" integer;