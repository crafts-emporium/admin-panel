ALTER TABLE "purchases" ADD COLUMN "deleted_at" timestamp DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "purchases" DROP COLUMN IF EXISTS "is_deleted";