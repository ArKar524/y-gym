-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('WEIGHT', 'HEIGHT', 'BODY_FAT', 'CHEST', 'WAIST', 'HIPS', 'BICEPS', 'THIGHS', 'CUSTOM');

-- CreateTable
CREATE TABLE "UserMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserMetric_userId_key_idx" ON "UserMetric"("userId", "key");

-- CreateIndex
CREATE INDEX "UserMetric_userId_recordedAt_idx" ON "UserMetric"("userId", "recordedAt");

-- AddForeignKey
ALTER TABLE "UserMetric" ADD CONSTRAINT "UserMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
