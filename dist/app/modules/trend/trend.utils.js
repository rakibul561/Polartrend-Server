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
exports.generateSlug = generateSlug;
exports.calculateMaturityStage = calculateMaturityStage;
exports.calculateAccuracy = calculateAccuracy;
exports.calculateSimilarity = calculateSimilarity;
exports.findAndCreateSimilarTrends = findAndCreateSimilarTrends;
exports.updateSimilarTrends = updateSimilarTrends;
exports.rebuildAllSimilarTrends = rebuildAllSimilarTrends;
exports.getSimilarityScore = getSimilarityScore;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../../lib/prisma");
/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}
/**
 * Calculate maturity stage based on mentions
 */
function calculateMaturityStage(mentions) {
    if (mentions < 30)
        return client_1.TrendMaturityStage.DISCOVERY;
    if (mentions < 80)
        return client_1.TrendMaturityStage.POLAR_TREND;
    if (mentions < 200)
        return client_1.TrendMaturityStage.EARLY_MAINSTREAM;
    return client_1.TrendMaturityStage.SATURATION;
}
/**
 * Calculate prediction accuracy
 */
function calculateAccuracy(daysSinceDetected, mentions) {
    if (daysSinceDetected < 7)
        return client_1.PredictionAccuracy.TOO_EARLY;
    if (mentions < 100)
        return client_1.PredictionAccuracy.RISING;
    return client_1.PredictionAccuracy.EXPLODING;
}
// ==========================================
// NEW: AUTOMATIC SIMILAR TREND DETECTION
// ==========================================
/**
 * Calculate similarity between two strings
 * Uses Jaccard similarity (word overlap)
 */
function calculateSimilarity(str1, str2) {
    // Convert to lowercase and split into words
    const words1 = new Set(str1.toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(word => word.length > 2) // Ignore small words
    );
    const words2 = new Set(str2.toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(word => word.length > 2));
    // Calculate intersection (common words)
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    // Calculate union (all unique words)
    const union = new Set([...words1, ...words2]);
    // Jaccard similarity = intersection / union
    if (union.size === 0)
        return 0;
    return intersection.size / union.size;
}
/**
 * Find and create similar trend relationships automatically
 * Called after creating a new trend
 */
function findAndCreateSimilarTrends(trendId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get the current trend
            const currentTrend = yield prisma_1.prisma.trend.findUnique({
                where: { id: trendId }
            });
            if (!currentTrend)
                return;
            // Get all other trends (excluding current one)
            const allTrends = yield prisma_1.prisma.trend.findMany({
                where: {
                    id: { not: trendId }
                }
            });
            console.log(`🔍 Finding similar trends for: "${currentTrend.title}"`);
            // Compare with each trend
            for (const otherTrend of allTrends) {
                // Calculate title similarity
                const titleSimilarity = calculateSimilarity(currentTrend.title, otherTrend.title);
                // Also check description similarity if available
                let descSimilarity = 0;
                if (currentTrend.description && otherTrend.description) {
                    descSimilarity = calculateSimilarity(currentTrend.description, otherTrend.description);
                }
                // Overall similarity (weighted average)
                const overallSimilarity = (titleSimilarity * 0.7) + (descSimilarity * 0.3);
                // If similarity > threshold (0.3), create relationship
                if (overallSimilarity > 0.3) {
                    try {
                        // Create bidirectional relationship
                        // From current -> other
                        yield prisma_1.prisma.similarTrend.upsert({
                            where: {
                                fromTrendId_toTrendId: {
                                    fromTrendId: trendId,
                                    toTrendId: otherTrend.id
                                }
                            },
                            create: {
                                fromTrendId: trendId,
                                toTrendId: otherTrend.id,
                                similarityScore: overallSimilarity
                            },
                            update: {
                                similarityScore: overallSimilarity
                            }
                        });
                        // From other -> current (reverse relationship)
                        yield prisma_1.prisma.similarTrend.upsert({
                            where: {
                                fromTrendId_toTrendId: {
                                    fromTrendId: otherTrend.id,
                                    toTrendId: trendId
                                }
                            },
                            create: {
                                fromTrendId: otherTrend.id,
                                toTrendId: trendId,
                                similarityScore: overallSimilarity
                            },
                            update: {
                                similarityScore: overallSimilarity
                            }
                        });
                        console.log(`✅ Linked: "${currentTrend.title}" ↔ "${otherTrend.title}" (${(overallSimilarity * 100).toFixed(1)}%)`);
                    }
                    catch (error) {
                        console.log(`⚠️  Relationship might already exist`);
                    }
                }
            }
            console.log(`✅ Similar trend detection completed for: "${currentTrend.title}"`);
        }
        catch (error) {
            console.error("❌ Error finding similar trends:", error);
        }
    });
}
/**
 * Update similar trends for an existing trend
 * Useful when trends are updated
 */
function updateSimilarTrends(trendId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Delete existing relationships
            yield prisma_1.prisma.similarTrend.deleteMany({
                where: {
                    OR: [
                        { fromTrendId: trendId },
                        { toTrendId: trendId }
                    ]
                }
            });
            // Recreate relationships
            yield findAndCreateSimilarTrends(trendId);
        }
        catch (error) {
            console.error("❌ Error updating similar trends:", error);
        }
    });
}
/**
 * Batch update all similar trends in database
 * Run this periodically or when needed
 */
function rebuildAllSimilarTrends() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔄 Rebuilding all similar trend relationships...");
            // Delete all existing relationships
            yield prisma_1.prisma.similarTrend.deleteMany({});
            // Get all trends
            const allTrends = yield prisma_1.prisma.trend.findMany();
            // Rebuild relationships for each trend
            for (const trend of allTrends) {
                yield findAndCreateSimilarTrends(trend.id);
            }
            console.log("✅ All similar trend relationships rebuilt successfully");
        }
        catch (error) {
            console.error("❌ Error rebuilding similar trends:", error);
        }
    });
}
/**
 * Get similarity score between two trends
 */
function getSimilarityScore(trendId1, trendId2) {
    return __awaiter(this, void 0, void 0, function* () {
        const trend1 = yield prisma_1.prisma.trend.findUnique({
            where: { id: trendId1 }
        });
        const trend2 = yield prisma_1.prisma.trend.findUnique({
            where: { id: trendId2 }
        });
        if (!trend1 || !trend2)
            return 0;
        const titleSimilarity = calculateSimilarity(trend1.title, trend2.title);
        let descSimilarity = 0;
        if (trend1.description && trend2.description) {
            descSimilarity = calculateSimilarity(trend1.description, trend2.description);
        }
        return (titleSimilarity * 0.7) + (descSimilarity * 0.3);
    });
}
