ALTER TABLE "purchase_items" ALTER COLUMN "variant_id" SET DATA TYPE varchar(30);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
