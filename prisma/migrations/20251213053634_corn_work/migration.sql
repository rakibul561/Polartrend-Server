/*
  Warnings:

  - A unique constraint covering the columns `[postUrl]` on the table `RedditMention` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "RedditCandidateMention" (
    "id" TEXT NOT NULL,
    "candidate" TEXT NOT NULL,
    "subreddit" TEXT NOT NULL,
    "postTitle" TEXT NOT NULL,
    "postUrl" TEXT NOT NULL,
    "mentionedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RedditCandidateMention_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RedditCandidateMention_postUrl_key" ON "RedditCandidateMention"("postUrl");

-- CreateIndex
CREATE UNIQUE INDEX "RedditMention_postUrl_key" ON "RedditMention"("postUrl");
