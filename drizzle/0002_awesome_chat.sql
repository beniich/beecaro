CREATE TABLE "esg_metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"total_carbon_ytd_tonnes" real,
	"target_carbon_ytd_tonnes" real,
	"carbon_reduction_percent" real,
	"scope1_kg_co2e" real,
	"scope2_kg_co2e" real,
	"scope3_kg_co2e" real,
	"solar_generated_kwh" real,
	"grid_import_kwh" real,
	"water_recycled_liters" real,
	"waste_diversion_rate" real,
	"carbon_credits_owned" integer,
	"carbon_credits_retired" integer,
	"air_quality_index_avg" integer,
	"green_building_cert" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leases" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_name" text NOT NULL,
	"tenant_industry" text,
	"contact_person" text,
	"contact_email" text,
	"building_name" text,
	"unit_code" text,
	"area_sq_m" integer,
	"start_date" text,
	"end_date" text,
	"monthly_rent_usd" integer,
	"deposit_usd" integer,
	"status" text,
	"esg_clause_compliant" text,
	"payment_status" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spaces" (
	"id" text PRIMARY KEY NOT NULL,
	"floor" text NOT NULL,
	"desks_total" integer,
	"occupied" integer,
	"occupancy_rate" integer,
	"temp_c" real,
	"department" text,
	"created_at" timestamp DEFAULT now()
);
