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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrendService = void 0;
const prisma_1 = require("../../../lib/prisma");
const trend_utils_1 = require("./trend.utils");
const createTrend = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, mentions24h, description } = payload;
    const slug = (0, trend_utils_1.generateSlug)(title);
    const maturityStage = (0, trend_utils_1.calculateMaturityStage)(mentions24h);
    const accuracyStatus = (0, trend_utils_1.calculateAccuracy)(0, mentions24h);
    // Create the trend
    const result = yield prisma_1.prisma.trend.create({
        data: {
            title,
            slug,
            mentions24h,
            historicalCount: 0,
            maturityStage,
            accuracyStatus,
            firstDetectedAt: new Date(),
            description: description || null
        }
    });
    // 🔥 NEW: Automatically find and create similar trends
    // This runs in background, doesn't block the response
    (0, trend_utils_1.findAndCreateSimilarTrends)(result.id).catch(err => {
        console.error("Error finding similar trends:", err);
    });
    return result;
});
const getSingleTrend = (trendId) => __awaiter(void 0, void 0, void 0, function* () {
    const trend = yield prisma_1.prisma.trend.findUniqueOrThrow({
        where: { id: trendId },
        include: {
            redditMentions: {
                orderBy: { mentionedAt: 'desc' },
                take: 10
            },
            historySnapshots: {
                orderBy: { snapshotDate: 'desc' },
                take: 30 // Last 30 days
            },
            // 🔥 NEW: Include similar trends in response
            similarTrendsFrom: {
                include: {
                    toTrend: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            mentions24h: true,
                            maturityStage: true,
                            accuracyStatus: true,
                            firstDetectedAt: true
                        }
                    }
                },
                orderBy: {
                    similarityScore: 'desc'
                },
                take: 5
            }
        }
    });
    // Format the response to include similarity scores
    const formattedTrend = Object.assign(Object.assign({}, trend), { similarTrends: trend.similarTrendsFrom.map(st => (Object.assign(Object.assign({}, st.toTrend), { similarityScore: st.similarityScore, similarityPercentage: `${(st.similarityScore * 100).toFixed(1)}%` }))) });
    // Remove the raw similarTrendsFrom field
    delete formattedTrend.similarTrendsFrom;
    return formattedTrend;
});
const getAllTrends = () => __awaiter(void 0, void 0, void 0, function* () {
    const trends = yield prisma_1.prisma.trend.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    redditMentions: true,
                    similarTrendsFrom: true,
                    historySnapshots: true
                }
            }
        }
    });
    const total = yield prisma_1.prisma.trend.count();
    return {
        meta: {
            total
        },
        data: trends
    };
});
const updateTrend = (trendId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const existing = yield prisma_1.prisma.trend.findUniqueOrThrow({
        where: { id: trendId }
    });
    const mentions = (_a = payload.mentions24h) !== null && _a !== void 0 ? _a : existing.mentions24h;
    const daysSinceDetected = (Date.now() - existing.firstDetectedAt.getTime()) /
        (1000 * 60 * 60 * 24);
    const maturityStage = (0, trend_utils_1.calculateMaturityStage)(mentions);
    const accuracyStatus = (0, trend_utils_1.calculateAccuracy)(Math.floor(daysSinceDetected), mentions);
    // Update the trend
    const updated = yield prisma_1.prisma.trend.update({
        where: { id: trendId },
        data: Object.assign(Object.assign({}, payload), { maturityStage,
            accuracyStatus })
    });
    // 🔥 NEW: If title or description changed, recalculate similar trends
    if (payload.title || payload.description) {
        console.log(`📝 Title/description updated, recalculating similar trends...`);
        // Delete old relationships for this trend
        yield prisma_1.prisma.similarTrend.deleteMany({
            where: {
                OR: [
                    { fromTrendId: trendId },
                    { toTrendId: trendId }
                ]
            }
        });
        // Recreate relationships
        (0, trend_utils_1.findAndCreateSimilarTrends)(trendId).catch(err => {
            console.error("Error recalculating similar trends:", err);
        });
    }
    return updated;
});
const deleteTrend = (trendId) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedTrend = yield prisma_1.prisma.trend.delete({
        where: { id: trendId }
    });
    return deletedTrend;
});
const getTrendsOneMonthAgo = () => __awaiter(void 0, void 0, void 0, function* () {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const startDate = new Date(oneMonthAgo);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(oneMonthAgo);
    endDate.setHours(23, 59, 59, 999);
    const trends = yield prisma_1.prisma.trend.findMany({
        where: {
            firstDetectedAt: {
                gte: startDate,
                lte: endDate
            }
        },
        include: {
            redditMentions: {
                take: 5,
                orderBy: { mentionedAt: 'desc' }
            },
            historySnapshots: {
                orderBy: { snapshotDate: 'desc' },
                take: 1
            },
            _count: {
                select: {
                    redditMentions: true,
                    similarTrendsFrom: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    // Add comparison data (then vs now)
    const trendsWithComparison = trends.map(trend => {
        const latestSnapshot = trend.historySnapshots[0];
        return Object.assign(Object.assign({}, trend), { comparison: {
                initialMentions: trend.mentions24h,
                currentMentions: (latestSnapshot === null || latestSnapshot === void 0 ? void 0 : latestSnapshot.mentions24h) || trend.mentions24h,
                initialStage: trend.maturityStage,
                currentStage: (latestSnapshot === null || latestSnapshot === void 0 ? void 0 : latestSnapshot.maturityStage) || trend.maturityStage,
                initialAccuracy: trend.accuracyStatus,
                currentAccuracy: (latestSnapshot === null || latestSnapshot === void 0 ? void 0 : latestSnapshot.accuracyStatus) || trend.accuracyStatus,
                growth: latestSnapshot
                    ? ((latestSnapshot.mentions24h - trend.mentions24h) / trend.mentions24h * 100).toFixed(1) + '%'
                    : '0%'
            } });
    });
    return trendsWithComparison;
});
const searchTrends = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const trends = yield prisma_1.prisma.trend.findMany({
        where: {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ]
        },
        take: 20,
        orderBy: { mentions24h: 'desc' },
        include: {
            _count: {
                select: {
                    redditMentions: true,
                    similarTrendsFrom: true
                }
            }
        }
    });
    return trends;
});
const getSimilarTrends = (trendId_1, ...args_1) => __awaiter(void 0, [trendId_1, ...args_1], void 0, function* (trendId, limit = 5) {
    const similarTrends = yield prisma_1.prisma.similarTrend.findMany({
        where: {
            fromTrendId: trendId
        },
        include: {
            toTrend: {
                include: {
                    redditMentions: {
                        take: 3,
                        orderBy: { mentionedAt: 'desc' }
                    },
                    _count: {
                        select: {
                            redditMentions: true,
                            similarTrendsFrom: true
                        }
                    }
                }
            }
        },
        orderBy: {
            similarityScore: 'desc'
        },
        take: limit
    });
    // Return with similarity score included
    return similarTrends.map(st => (Object.assign(Object.assign({}, st.toTrend), { similarityScore: st.similarityScore, similarityPercentage: `${(st.similarityScore * 100).toFixed(1)}%` })));
});
const addRedditMentions = (trendId, mentions) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify trend exists
    yield prisma_1.prisma.trend.findUniqueOrThrow({
        where: { id: trendId }
    });
    const createdMentions = yield prisma_1.prisma.redditMention.createMany({
        data: mentions.map(m => (Object.assign({ trendId }, m)))
    });
    // Update trend's mention count
    const newMentionCount = yield prisma_1.prisma.redditMention.count({
        where: { trendId }
    });
    yield prisma_1.prisma.trend.update({
        where: { id: trendId },
        data: {
            mentions24h: newMentionCount
        }
    });
    return createdMentions;
});
const createHistorySnapshot = (trendId) => __awaiter(void 0, void 0, void 0, function* () {
    const trend = yield prisma_1.prisma.trend.findUnique({
        where: { id: trendId }
    });
    if (!trend)
        throw new Error('Trend not found');
    const snapshot = yield prisma_1.prisma.trendHistory.create({
        data: {
            trendId,
            snapshotDate: new Date(),
            mentions24h: trend.mentions24h,
            maturityStage: trend.maturityStage,
            accuracyStatus: trend.accuracyStatus
        }
    });
    return snapshot;
});
const addSimilarTrend = (fromTrendId_1, toTrendId_1, ...args_1) => __awaiter(void 0, [fromTrendId_1, toTrendId_1, ...args_1], void 0, function* (fromTrendId, toTrendId, similarityScore = 0.7) {
    // Verify both trends exist
    yield prisma_1.prisma.trend.findUniqueOrThrow({
        where: { id: fromTrendId }
    });
    yield prisma_1.prisma.trend.findUniqueOrThrow({
        where: { id: toTrendId }
    });
    // Create bidirectional relationship
    const relationship1 = yield prisma_1.prisma.similarTrend.upsert({
        where: {
            fromTrendId_toTrendId: {
                fromTrendId,
                toTrendId
            }
        },
        create: {
            fromTrendId,
            toTrendId,
            similarityScore
        },
        update: {
            similarityScore
        }
    });
    // Reverse relationship
    yield prisma_1.prisma.similarTrend.upsert({
        where: {
            fromTrendId_toTrendId: {
                fromTrendId: toTrendId,
                toTrendId: fromTrendId
            }
        },
        create: {
            fromTrendId: toTrendId,
            toTrendId: fromTrendId,
            similarityScore
        },
        update: {
            similarityScore
        }
    });
    return relationship1;
});
const getTrendsWithFilters = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const where = {};
    if (filters.maturityStage) {
        where.maturityStage = filters.maturityStage;
    }
    if (filters.accuracyStatus) {
        where.accuracyStatus = filters.accuracyStatus;
    }
    const trends = yield prisma_1.prisma.trend.findMany({
        where,
        include: {
            redditMentions: {
                take: 5,
                orderBy: { mentionedAt: 'desc' }
            },
            _count: {
                select: {
                    redditMentions: true,
                    similarTrendsFrom: true,
                    historySnapshots: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 20,
        skip: filters.offset || 0
    });
    const total = yield prisma_1.prisma.trend.count({ where });
    return {
        meta: {
            total,
            limit: filters.limit || 20,
            offset: filters.offset || 0
        },
        data: trends
    };
});
const rebuildAllSimilarTrends = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔄 Rebuilding all similar trend relationships...");
    // Delete all existing relationships
    yield prisma_1.prisma.similarTrend.deleteMany({});
    // Get all trends
    const allTrends = yield prisma_1.prisma.trend.findMany();
    // Rebuild relationships for each trend
    for (const trend of allTrends) {
        yield (0, trend_utils_1.findAndCreateSimilarTrends)(trend.id);
    }
    const totalRelationships = yield prisma_1.prisma.similarTrend.count();
    console.log(`✅ Rebuilt ${totalRelationships} similar trend relationships`);
    return {
        message: "All similar trends rebuilt successfully",
        totalTrends: allTrends.length,
        totalRelationships
    };
});
const getTrendingNow = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 10) {
    const trends = yield prisma_1.prisma.trend.findMany({
        where: {
            maturityStage: {
                in: ['DISCOVERY', 'POLAR_TREND', 'EARLY_MAINSTREAM']
            }
        },
        orderBy: [
            { mentions24h: 'desc' },
            { createdAt: 'desc' }
        ],
        take: limit,
        include: {
            redditMentions: {
                take: 3,
                orderBy: { mentionedAt: 'desc' }
            },
            _count: {
                select: {
                    redditMentions: true,
                    similarTrendsFrom: true
                }
            }
        }
    });
    return trends;
});
const getStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const total = yield prisma_1.prisma.trend.count();
    const byMaturity = yield prisma_1.prisma.trend.groupBy({
        by: ['maturityStage'],
        _count: true
    });
    const byAccuracy = yield prisma_1.prisma.trend.groupBy({
        by: ['accuracyStatus'],
        _count: true
    });
    const totalMentions = yield prisma_1.prisma.redditMention.count();
    const totalRelationships = yield prisma_1.prisma.similarTrend.count();
    return {
        totalTrends: total,
        totalRedditMentions: totalMentions,
        totalSimilarRelationships: totalRelationships,
        byMaturityStage: byMaturity,
        byAccuracyStatus: byAccuracy
    };
});
exports.TrendService = {
    createTrend,
    getSingleTrend,
    getAllTrends,
    updateTrend,
    deleteTrend,
    getTrendsOneMonthAgo,
    searchTrends,
    getSimilarTrends,
    addRedditMentions,
    createHistorySnapshot,
    addSimilarTrend,
    getTrendsWithFilters,
    rebuildAllSimilarTrends,
    getTrendingNow,
    getStats
};
