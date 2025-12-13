import { PredictionAccuracy, TrendMaturityStage } from "@prisma/client";
import { prisma } from "../../../lib/prisma";

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Calculate maturity stage based on mentions
 */
export function calculateMaturityStage(
  mentions: number
): TrendMaturityStage {
  if (mentions < 30) return TrendMaturityStage.DISCOVERY;
  if (mentions < 80) return TrendMaturityStage.POLAR_TREND;
  if (mentions < 200) return TrendMaturityStage.EARLY_MAINSTREAM;
  return TrendMaturityStage.SATURATION;
}

/**
 * Calculate prediction accuracy
 */
export function calculateAccuracy(
  daysSinceDetected: number,
  mentions: number
): PredictionAccuracy {
  if (daysSinceDetected < 7) return PredictionAccuracy.TOO_EARLY;
  if (mentions < 100) return PredictionAccuracy.RISING;
  return PredictionAccuracy.EXPLODING;
}

// ==========================================
// NEW: AUTOMATIC SIMILAR TREND DETECTION
// ==========================================

/**
 * Calculate similarity between two strings
 * Uses Jaccard similarity (word overlap)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  // Convert to lowercase and split into words
  const words1 = new Set(
    str1.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 2) // Ignore small words
  );

  const words2 = new Set(
    str2.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 2)
  );

  // Calculate intersection (common words)
  const intersection = new Set(
    [...words1].filter(word => words2.has(word))
  );

  // Calculate union (all unique words)
  const union = new Set([...words1, ...words2]);

  // Jaccard similarity = intersection / union
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * Find and create similar trend relationships automatically
 * Called after creating a new trend
 */
export async function findAndCreateSimilarTrends(
  trendId: string
): Promise<void> {
  try {
    // Get the current trend
    const currentTrend = await prisma.trend.findUnique({
      where: { id: trendId }
    });

    if (!currentTrend) return;

    // Get all other trends (excluding current one)
    const allTrends = await prisma.trend.findMany({
      where: {
        id: { not: trendId }
      }
    });

    console.log(`🔍 Finding similar trends for: "${currentTrend.title}"`);

    // Compare with each trend
    for (const otherTrend of allTrends) {
      // Calculate title similarity
      const titleSimilarity = calculateSimilarity(
        currentTrend.title,
        otherTrend.title
      );

      // Also check description similarity if available
      let descSimilarity = 0;
      if (currentTrend.description && otherTrend.description) {
        descSimilarity = calculateSimilarity(
          currentTrend.description,
          otherTrend.description
        );
      }

      // Overall similarity (weighted average)
      const overallSimilarity = (titleSimilarity * 0.7) + (descSimilarity * 0.3);

      // If similarity > threshold (0.3), create relationship
      if (overallSimilarity > 0.3) {
        try {
          // Create bidirectional relationship
          // From current -> other
          await prisma.similarTrend.upsert({
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
          await prisma.similarTrend.upsert({
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

          console.log(
            `✅ Linked: "${currentTrend.title}" ↔ "${otherTrend.title}" (${(overallSimilarity * 100).toFixed(1)}%)`
          );
        } catch (error) {
          console.log(`⚠️  Relationship might already exist`);
        }
      }
    }

    console.log(`✅ Similar trend detection completed for: "${currentTrend.title}"`);
  } catch (error) {
    console.error("❌ Error finding similar trends:", error);
  }
}

/**
 * Update similar trends for an existing trend
 * Useful when trends are updated
 */
export async function updateSimilarTrends(trendId: string): Promise<void> {
  try {
    // Delete existing relationships
    await prisma.similarTrend.deleteMany({
      where: {
        OR: [
          { fromTrendId: trendId },
          { toTrendId: trendId }
        ]
      }
    });

    // Recreate relationships
    await findAndCreateSimilarTrends(trendId);
  } catch (error) {
    console.error("❌ Error updating similar trends:", error);
  }
}

/**
 * Batch update all similar trends in database
 * Run this periodically or when needed
 */
export async function rebuildAllSimilarTrends(): Promise<void> {
  try {
    console.log("🔄 Rebuilding all similar trend relationships...");

    // Delete all existing relationships
    await prisma.similarTrend.deleteMany({});

    // Get all trends
    const allTrends = await prisma.trend.findMany();

    // Rebuild relationships for each trend
    for (const trend of allTrends) {
      await findAndCreateSimilarTrends(trend.id);
    }

    console.log("✅ All similar trend relationships rebuilt successfully");
  } catch (error) {
    console.error("❌ Error rebuilding similar trends:", error);
  }
}

/**
 * Get similarity score between two trends
 */
export async function getSimilarityScore(
  trendId1: string,
  trendId2: string
): Promise<number> {
  const trend1 = await prisma.trend.findUnique({
    where: { id: trendId1 }
  });

  const trend2 = await prisma.trend.findUnique({
    where: { id: trendId2 }
  });

  if (!trend1 || !trend2) return 0;

  const titleSimilarity = calculateSimilarity(trend1.title, trend2.title);

  let descSimilarity = 0;
  if (trend1.description && trend2.description) {
    descSimilarity = calculateSimilarity(
      trend1.description,
      trend2.description
    );
  }

  return (titleSimilarity * 0.7) + (descSimilarity * 0.3);
}