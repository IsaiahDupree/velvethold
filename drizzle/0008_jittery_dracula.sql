ALTER TABLE "date_requests" ADD COLUMN "date_confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "date_requests" ADD COLUMN "confirmed_date_time" timestamp;--> statement-breakpoint
ALTER TABLE "date_requests" ADD COLUMN "confirmed_location" varchar(500);--> statement-breakpoint
ALTER TABLE "date_requests" ADD COLUMN "confirmed_details" text;--> statement-breakpoint
ALTER TABLE "date_requests" ADD COLUMN "invitee_confirmed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "date_requests" ADD COLUMN "requester_confirmed" boolean DEFAULT false NOT NULL;