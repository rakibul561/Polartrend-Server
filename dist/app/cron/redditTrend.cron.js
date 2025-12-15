"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../../lib/prisma");
const trend_services_1 = require("../modules/trend/trend.services");
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
function fetchSubredditPosts(subreddit) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=25`;
        const res = yield axios_1.default.get(url, {
            headers: { "User-Agent": USER_AGENT },
            timeout: 8000
        });
        return ((_b = (_a = res.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.children) || [];
    });
}
/* ================= MAIN LOGIC ================= */
function scanRedditAndDetectTrends() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log("🔍 [CRON] Scanning Reddit...");
        /* -------- STEP 1: Collect candidate mentions -------- */
        for (const subreddit of SUBREDDITS) {
            try {
                const posts = yield fetchSubredditPosts(subreddit);
                for (const post of posts) {
                    const title = (_a = post.data.title) !== null && _a !== void 0 ? _a : "";
                    const lowerTitle = title.toLowerCase();
                    const postUrl = `https://reddit.com${post.data.permalink}`;
                    const mentionedAt = new Date(post.data.created_utc * 1000);
                    const keyword = KEYWORDS.find(k => lowerTitle.includes(k));
                    if (!keyword)
                        continue;
                    const alreadySaved = yield prisma_1.prisma.redditCandidateMention.findFirst({
                        where: { postUrl }
                    });
                    if (alreadySaved)
                        continue;
                    yield prisma_1.prisma.redditCandidateMention.create({
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
            }
            catch (err) {
                console.warn(`⚠️ Failed r/${subreddit}`);
            }
        }
        /* -------- STEP 2: Create trends -------- */
        for (const keyword of KEYWORDS) {
            const mentionsCount = yield prisma_1.prisma.redditCandidateMention.count({
                where: {
                    candidate: keyword,
                    mentionedAt: {
                        gte: new Date(Date.now() - WINDOW_MINUTES * 60 * 1000)
                    }
                }
            });
            console.log(`📊 "${keyword}" → ${mentionsCount} mentions`);
            if (mentionsCount < TREND_THRESHOLD)
                continue;
            // 🔑 hourly unique trend
            const hourKey = new Date().toISOString().slice(0, 13);
            const trendTitle = `Trend: ${keyword} @ ${hourKey}`;
            const exists = yield prisma_1.prisma.trend.findFirst({
                where: { title: trendTitle }
            });
            if (exists)
                continue;
            const trend = yield trend_services_1.TrendService.createTrend({
                title: trendTitle,
                mentions24h: mentionsCount,
                description: `Auto detected trend for keyword "${keyword}"`
            });
            console.log(`🚀 TREND CREATED → ${trendTitle}`);
            /* -------- STEP 3: Attach proof mentions -------- */
            const proofs = yield prisma_1.prisma.redditCandidateMention.findMany({
                where: { candidate: keyword }
            });
            for (const proof of proofs) {
                yield prisma_1.prisma.redditMention.create({
                    data: {
                        trendId: trend.id,
                        subreddit: proof.subreddit,
                        postTitle: proof.postTitle,
                        postUrl: proof.postUrl,
                        mentionedAt: proof.mentionedAt
                    }
                });
            }
            yield prisma_1.prisma.redditCandidateMention.deleteMany({
                where: { candidate: keyword }
            });
            console.log(`🧹 Cleaned candidates → ${keyword}`);
        }
    });
}
// runs every 30 seconds (for testing)
node_cron_1.default.schedule("*/30 * * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield scanRedditAndDetectTrends();
    }
    catch (err) {
        console.error("❌ CRON failed", err);
    }
}));
