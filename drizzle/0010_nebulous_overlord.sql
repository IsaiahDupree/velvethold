CREATE TYPE "public"."deal_stage" AS ENUM('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost');--> statement-breakpoint
CREATE TYPE "public"."email_event_type" AS ENUM('delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed');--> statement-breakpoint
CREATE TYPE "public"."event_source" AS ENUM('web', 'app', 'email', 'stripe', 'booking', 'meta');--> statement-breakpoint
CREATE TYPE "public"."identity_provider" AS ENUM('posthog', 'stripe', 'meta', 'app');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'past_due', 'trialing', 'paused');--> statement-breakpoint
CREATE TABLE "deal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"stage" "deal_stage" DEFAULT 'lead' NOT NULL,
	"value" integer,
	"source" varchar(255),
	"notes" text,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_message_id" uuid NOT NULL,
	"event_type" "email_event_type" NOT NULL,
	"link" varchar(1000),
	"user_agent" text,
	"ip_address" varchar(45),
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid,
	"message_id" varchar(255) NOT NULL,
	"subject" varchar(500),
	"template" varchar(255),
	"tags" jsonb,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_message_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid,
	"event_name" varchar(255) NOT NULL,
	"source" "event_source" NOT NULL,
	"properties" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"session_id" varchar(255),
	"device_id" varchar(255),
	"user_agent" text,
	"ip_address" varchar(45)
);
--> statement-breakpoint
CREATE TABLE "identity_link" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"provider" "identity_provider" NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255),
	"phone" varchar(20),
	"name" varchar(255),
	"traits" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"active_days" integer DEFAULT 0 NOT NULL,
	"core_actions" integer DEFAULT 0 NOT NULL,
	"pricing_views" integer DEFAULT 0 NOT NULL,
	"email_opens" integer DEFAULT 0 NOT NULL,
	"email_clicks" integer DEFAULT 0 NOT NULL,
	"last_active_at" timestamp,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "person_features_person_id_unique" UNIQUE("person_id")
);
--> statement-breakpoint
CREATE TABLE "segment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"criteria" jsonb NOT NULL,
	"automation_config" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"stripe_subscription_id" varchar(255) NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"status" "subscription_status" NOT NULL,
	"plan_name" varchar(255),
	"plan_interval" varchar(50),
	"mrr" integer,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_event" ADD CONSTRAINT "email_event_email_message_id_email_message_id_fk" FOREIGN KEY ("email_message_id") REFERENCES "public"."email_message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_message" ADD CONSTRAINT "email_message_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity_link" ADD CONSTRAINT "identity_link_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_features" ADD CONSTRAINT "person_features_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;