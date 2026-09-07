CREATE TABLE "buildings" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"floors" integer,
	"area_sq_m" integer,
	"occupancy_rate" integer,
	"energy_rating" text,
	"carbon_intensity" real,
	"health_score" integer,
	"address" text,
	"status" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "telemetry_nodes" (
	"id" text PRIMARY KEY NOT NULL,
	"x" real,
	"y" real,
	"z" real,
	"label" text NOT NULL,
	"type" text,
	"value" text,
	"status" text,
	"floor" integer,
	"created_at" timestamp DEFAULT now()
);
