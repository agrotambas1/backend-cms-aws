/*
  Warnings:

  - You are about to drop the `events` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_created_by_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_industry_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_service_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_thumbnail_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_updated_by_fkey";

-- DropTable
DROP TABLE "events";
