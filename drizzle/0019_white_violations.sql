ALTER TABLE "purchase_items" ALTER COLUMN "cost_price" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "purchase_items" ALTER COLUMN "discounted_price" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "discounted_price" SET DEFAULT 0;