-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "farms" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "location" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "total_bigha" DECIMAL(10,2),

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable
CREATE TABLE "plots"(
    "id" SERIAL NOT NULL,
    "farm_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "area_bigha" DECIMAL(10,2) NOT NULL,
    "label_color" VARCHAR(50),
    "status" VARCHAR(50),

    CONSTRAINT "plots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crop"(
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "variety" VARCHAR(255),
    "protocol" JSONB,

    CONSTRAINT "crops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantings" (
    "id" SERIAL NOT NULL,
    "plot_id" INTEGER NOT NULL,
    "crop_id" INTEGER NOT NULL,
    "sow_date" DATE,
    "plant_count" INTEGER,
    "expected_harvest" DATE,
    "status" VARCHAR(50),

    CONSTRAINT "plantings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "farm_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "role" VARCHAR(50),
    "monthly_salary" DECIMAL(10,2),
    "join_date" DATE,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plot_assignments" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "plot_id" INTEGER NOT NULL,

    CONSTRAINT "plot_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" SERIAL NOT NULL,
    "planting_id" INTEGER NOT NULL,
    "type" VARCHAR(50),
    "recurrence" VARCHAR(50),
    "interval_days" INTEGER,
    "start_date" DATE,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "schedule_id" INTEGER,
    "planting_id" INTEGER,
    "due_date" DATE,
    "status" VARCHAR(50),
    "done_by" INTEGER,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" SERIAL NOT NULL,
    "planting_id" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "type" VARCHAR(50),
    "performed_at" TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_entries" (
    "id" SERIAL NOT NULL,
    "farm_id" INTEGER NOT NULL,
    "plot_id" INTEGER,
    "planting_id" INTEGER,
    "category" VARCHAR(50),
    "amount" DECIMAL(10,2),
    "incurred_on" DATE,
    "activity_id" INTEGER,

    CONSTRAINT "cost_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yields" (
    "id" SERIAL NOT NULL,
    "planting_id" INTEGER NOT NULL,
    "quantity_kg" DECIMAL(10,2),
    "harvested_on" DATE,
    "photo_keys" JSONB,

    CONSTRAINT "yields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" SERIAL NOT NULL,
    "planting_id" INTEGER NOT NULL,
    "quantity_kg" DECIMAL(10,2),
    "rate_per_kg" DECIMAL(10,2),
    "buyer" VARCHAR(255),
    "sold_on" DATE,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" SERIAL NOT NULL,
    "farm_id" INTEGER NOT NULL,
    "item_name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50),
    "qty_on_hand" DECIMAL(10,2),
    "unit" VARCHAR(50),
    "reorder_level" DECIMAL(10,2),

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);