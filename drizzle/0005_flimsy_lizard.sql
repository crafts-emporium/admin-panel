CREATE TABLE IF NOT EXISTS "purchase_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_id" integer,
	"variant_id" integer,
	"quantity" integer NOT NULL,
	"price" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "discounted_price" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "purchases" DROP COLUMN IF EXISTS "variant_id";--> statement-breakpoint
ALTER TABLE "purchases" DROP COLUMN IF EXISTS "quantity";