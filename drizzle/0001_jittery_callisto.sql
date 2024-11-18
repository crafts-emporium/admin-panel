ALTER TABLE "customers" ADD COLUMN "name" varchar(40) NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "variants" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN IF EXISTS "first_name";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN IF EXISTS "last_name";