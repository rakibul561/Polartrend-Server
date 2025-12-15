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
exports.runTrendLifecycleSnapshot = runTrendLifecycleSnapshot;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../../lib/prisma");
const trend_utils_1 = require("../modules/trend/trend.utils");
/**
 * 🔁 TESTABLE function
 * (export করা – manual test এর জন্য)
 */
function runTrendLifecycleSnapshot() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("📸 [CRON][TEST] Running trend lifecycle snapshot...");
        const trends = yield prisma_1.prisma.trend.findMany();
        for (const trend of trends) {
            // 🔹 last 24h mentions
            const mentions24h = yield prisma_1.prisma.redditMention.count({
                where: {
                    trendId: trend.id,
                    mentionedAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                }
            });
            const daysSinceDetected = (Date.now() - trend.firstDetectedAt.getTime()) /
                (1000 * 60 * 60 * 24);
            const newMaturity = (0, trend_utils_1.calculateMaturityStage)(mentions24h);
            const newAccuracy = (0, trend_utils_1.calculateAccuracy)(Math.floor(daysSinceDetected), mentions24h);
            // 🔹 snapshot save
            yield prisma_1.prisma.trendHistory.create({
                data: {
                    trendId: trend.id,
                    snapshotDate: new Date(),
                    mentions24h,
                    maturityStage: newMaturity,
                    accuracyStatus: newAccuracy
                }
            });
            // 🔹 trend update
            yield prisma_1.prisma.trend.update({
                where: { id: trend.id },
                data: {
                    mentions24h,
                    maturityStage: newMaturity,
                    accuracyStatus: newAccuracy
                }
            });
            console.log(`✅ ${trend.title} → ${newMaturity} | ${newAccuracy}`);
        }
    });
}
/**
 * ⏰ TEST MODE
 * Every 1 minute
 */
node_cron_1.default.schedule("* * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield runTrendLifecycleSnapshot();
    }
    catch (err) {
        console.error("❌ Trend lifecycle cron failed", err);
    }
}));
