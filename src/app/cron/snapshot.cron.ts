import cron from "node-cron";
import { prisma } from "../../lib/prisma";
import {
  calculateMaturityStage,
  calculateAccuracy
} from "../modules/trend/trend.utils";

/**
 * 🔁 TESTABLE function
 * (export করা – manual test এর জন্য)
 */
export async function runTrendLifecycleSnapshot() {
  console.log("📸 [CRON][TEST] Running trend lifecycle snapshot...");

  const trends = await prisma.trend.findMany();

  for (const trend of trends) {
    // 🔹 last 24h mentions
    const mentions24h = await prisma.redditMention.count({
      where: {
        trendId: trend.id,
        mentionedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    const daysSinceDetected =
      (Date.now() - trend.firstDetectedAt.getTime()) /
      (1000 * 60 * 60 * 24);

    const newMaturity = calculateMaturityStage(mentions24h);
    const newAccuracy = calculateAccuracy(
      Math.floor(daysSinceDetected),
      mentions24h
    );

    // 🔹 snapshot save
    await prisma.trendHistory.create({
      data: {
        trendId: trend.id,
        snapshotDate: new Date(),
        mentions24h,
        maturityStage: newMaturity,
        accuracyStatus: newAccuracy
      }
    });

    // 🔹 trend update
    await prisma.trend.update({
      where: { id: trend.id },
      data: {
        mentions24h,
        maturityStage: newMaturity,
        accuracyStatus: newAccuracy
      }
    });

    console.log(
      `✅ ${trend.title} → ${newMaturity} | ${newAccuracy}`
    );
  }
}

/**
 * ⏰ TEST MODE
 * Every 1 minute
 */
cron.schedule("* * * * *", async () => {
  try {
    await runTrendLifecycleSnapshot();
  } catch (err) {
    console.error("❌ Trend lifecycle cron failed", err);
  }
});
