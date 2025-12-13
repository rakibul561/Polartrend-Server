/*
  Warnings:

  - You are about to drop the `tasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TrendMaturityStage" AS ENUM ('DISCOVERY', 'POLAR_TREND', 'EARLY_MAINSTREAM', 'SATURATION');

-- CreateEnum
CREATE TYPE "PredictionAccuracy" AS ENUM ('TOO_EARLY', 'RISING', 'EXPLODING');

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assignedToId_fkey";

-- DropTable
DROP TABLE "tasks";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "TaskPriority";

-- DropEnum
DROP TYPE "TaskStatus";

-- CreateTable
CREATE TABLE "Trend" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "mentions24h" INTEGER NOT NULL,
    "historicalCount" INTEGER NOT NULL,
    "maturityStage" "TrendMaturityStage" NOT NULL,
    "accuracyStatus" "PredictionAccuracy" NOT NULL,
    "firstDetectedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedditMention" (
    "id" TEXT NOT NULL,
    "trendId" TEXT NOT NULL,
    "subreddit" TEXT NOT NULL,
    "postTitle" TEXT NOT NULL,
    "postUrl" TEXT NOT NULL,
    "mentionedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RedditMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendHistory" (
    "id" TEXT NOT NULL,
    "trendId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "mentions24h" INTEGER NOT NULL,
    "maturityStage" "TrendMaturityStage" NOT NULL,
    "accuracyStatus" "PredictionAccuracy" NOT NULL,

    CONSTRAINT "TrendHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimilarTrend" (
    "id" TEXT NOT NULL,
    "fromTrendId" TEXT NOT NULL,
    "toTrendId" TEXT NOT NULL,
    "similarityScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SimilarTrend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trend_title_key" ON "Trend"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Trend_slug_key" ON "Trend"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TrendHistory_trendId_snapshotDate_key" ON "TrendHistory"("trendId", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "SimilarTrend_fromTrendId_toTrendId_key" ON "SimilarTrend"("fromTrendId", "toTrendId");

-- AddForeignKey
ALTER TABLE "RedditMention" ADD CONSTRAINT "RedditMention_trendId_fkey" FOREIGN KEY ("trendId") REFERENCES "Trend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendHistory" ADD CONSTRAINT "TrendHistory_trendId_fkey" FOREIGN KEY ("trendId") REFERENCES "Trend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimilarTrend" ADD CONSTRAINT "SimilarTrend_fromTrendId_fkey" FOREIGN KEY ("fromTrendId") REFERENCES "Trend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimilarTrend" ADD CONSTRAINT "SimilarTrend_toTrendId_fkey" FOREIGN KEY ("toTrendId") REFERENCES "Trend"("id") ON DELETE CASCADE ON UPDATE CASCADE;
