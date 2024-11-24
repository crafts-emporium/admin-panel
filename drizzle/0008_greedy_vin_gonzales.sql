ALTER TABLE "products" ADD COLUMN "deleted_at" date DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "created_at" date DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "variants" ADD COLUMN "deleted_at" date DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN IF EXISTS "is_deleted";--> statement-breakpoint
ALTER TABLE "variants" DROP COLUMN IF EXISTS "is_deleted";