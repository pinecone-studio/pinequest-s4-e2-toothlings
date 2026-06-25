-- Screener-set next-season screening schedule + optional reminder phone.
ALTER TABLE "SchoolClass" ADD COLUMN "scheduledAt" DATETIME;
ALTER TABLE "SchoolClass" ADD COLUMN "reminderPhone" TEXT;
