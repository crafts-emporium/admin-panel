ALTER TABLE "customers" ALTER COLUMN "created_at" SET DEFAULT CURRENT_DATE;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_at" SET DEFAULT CURRENT_DATE;--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "variants" ALTER COLUMN "created_at" SET DEFAULT CURRENT_DATE;