ALTER TABLE "products" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "variants" DROP COLUMN IF EXISTS "image";