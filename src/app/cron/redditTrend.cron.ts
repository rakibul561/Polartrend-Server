import cron from "node-cron";
import axios from "axios";
import { prisma } from "../../lib/prisma";
import { TrendService } from "../modules/trend/trend.services";

/* ================= CONFIG ================= */

const SUBREDDITS = [
  "SideProject",
  "startups",
  "Entrepreneur",
  "SaaS",
  "MachineLearning",
  "LocalLLaMA",
  "OpenAI"
];

const KEYWORDS = [
  "local", "llm", "offline", "on device",
  "agent", "rag", "open source", "edge ai",
  "privacy", "self host", "inference"
];

const USER_AGENT = "polartrend-bot/1.0";

// minimum mentions to create a trend
const TREND_THRESHOLD = 1;

// lookback window (24 hours)
const WINDOW_MINUTES = 24 * 60;

/* ================= HELPERS ================= */

async function fetchSubredditPosts(subreddit: string) {
  const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=25`;

  const res = await axios.get(url, {
    headers: { "User-Agent": USER_AGENT },
    timeout: 8000
  });

  return res.data?.data?.children || [];
}

/* ================= MAIN LOGIC ================= */

async function scanRedditAndDetectTrends() {
  console.log("🔍 [CRON] Scanning Reddit...");

  /* -------- STEP 1: Collect candidate mentions -------- */
  for (const subreddit of SUBREDDITS) {
    try {
      const posts = await fetchSubredditPosts(subreddit);

      for (const post of posts) {
        const title = post.data.title ?? "";
        const lowerTitle = title.toLowerCase();
        const postUrl = `https://reddit.com${post.data.permalink}`;
        const mentionedAt = new Date(post.data.created_utc * 1000);

        const keyword = KEYWORDS.find(k =>
          lowerTitle.includes(k)
        );

        if (!keyword) continue;

        const alreadySaved = await prisma.redditCandidateMention.findFirst({
          where: { postUrl }
        });

        if (alreadySaved) continue;

        await prisma.redditCandidateMention.create({
          data: {
            candidate: keyword,
            subreddit,
            postTitle: title,
            postUrl,
            mentionedAt
          }
        });

        console.log(`➕ Candidate → "${keyword}" | r/${subreddit}`);
      }
    } catch (err) {
      console.warn(`⚠️ Failed r/${subreddit}`);
    }
  }

  /* -------- STEP 2: Create trends -------- */
  for (const keyword of KEYWORDS) {
    const mentionsCount = await prisma.redditCandidateMention.count({
      where: {
        candidate: keyword,
        mentionedAt: {
          gte: new Date(Date.now() - WINDOW_MINUTES * 60 * 1000)
        }
      }
    });

    

    console.log(`📊 "${keyword}" → ${mentionsCount} mentions`);

    if (mentionsCount < TREND_THRESHOLD) continue;

    // 🔑 hourly unique trend
    const hourKey = new Date().toISOString().slice(0, 13);
    const trendTitle = `Trend: ${keyword} @ ${hourKey}`;

    const exists = await prisma.trend.findFirst({
      where: { title: trendTitle }
    });

    if (exists) continue;

    const trend = await TrendService.createTrend({
      title: trendTitle,
      mentions24h: mentionsCount,
      description: `Auto detected trend for keyword "${keyword}"`
    });

    console.log(`🚀 TREND CREATED → ${trendTitle}`);
    

    /* -------- STEP 3: Attach proof mentions -------- */
    const proofs = await prisma.redditCandidateMention.findMany({
      where: { candidate: keyword }
    });

    for (const proof of proofs) {
      await prisma.redditMention.create({
        data: {
          trendId: trend.id,
          subreddit: proof.subreddit,
          postTitle: proof.postTitle,
          postUrl: proof.postUrl,
          mentionedAt: proof.mentionedAt
        }
      });
    }

    await prisma.redditCandidateMention.deleteMany({
      where: { candidate: keyword }
    });

    console.log(`🧹 Cleaned candidates → ${keyword}`);
  }
}


// runs every 30 seconds (for testing)
cron.schedule("*/30 * * * * *", async () => {
  try {
    await scanRedditAndDetectTrends();
  } catch (err) {
    console.error("❌ CRON failed", err);
  }
});
