CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"category" text NOT NULL,
	"building_id" text,
	"building_name" text,
	"floor" text,
	"zone" text,
	"status" text NOT NULL,
	"health_score" integer,
	"last_inspected" text,
	"next_service" text,
	"install_date" text,
	"manufacturer" text,
	"model" text,
	"serial_number" text,
	"power_consumption_kw" real,
	"telemetry" jsonb,
	"qr_code_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_number" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"asset_id" text,
	"asset_name" text,
	"building_id" text,
	"building_name" text,
	"floor" text,
	"priority" text NOT NULL,
	"status" text NOT NULL,
	"category" text,
	"assigned_technician" jsonb,
	"created_at" text,
	"sla_deadline" text,
	"estimated_hours" real,
	"actual_hours" real,
	"parts_used" jsonb
);
--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;