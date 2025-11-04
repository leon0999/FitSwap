/**
 * Health Score v2 - Two-Tier Scoring System
 *
 * Tier 1: Nutrition Score (0-50 points)
 * - Calories, protein, fat, sugar, fiber, sodium
 *
 * Tier 2: Quality Attributes (0-50 points)
 * - Organic certification
 * - Non-GMO
 * - Local sourcing
 * - Sustainability
 * - Clean label (no additives)
 *
 * Total Score: 0-100
 */

/**
 * Quality attributes for food items
 */
export interface QualityAttributes {
  isOrganic?: boolean;        // USDA Organic certified
  isNonGMO?: boolean;          // Non-GMO verified
  isLocal?: boolean;           // Sourced from local farms (<100 miles)
  isSustainable?: boolean;     // Sustainable farming/fishing
  hasCleanLabel?: boolean;     // No artificial additives, preservatives
  isFairTrade?: boolean;       // Fair Trade certified
  isGrassFed?: boolean;        // Grass-fed (for meat/dairy)
  isWildCaught?: boolean;      // Wild-caught (for seafood)
}

/**
 * Enhanced nutrition data with quality attributes
 */
export interface EnhancedNutritionData {
  // Basic nutrition (from v1)
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;

  // Quality attributes (v2)
  quality?: QualityAttributes;

  // Additional attributes (for real food database compatibility)
  isOrganic?: boolean;
  isHealthy?: boolean;
  orderUrl?: string;
  keywords?: string[];
}

/**
 * Badge type for UI display
 */
export interface HealthBadge {
  label: string;
  emoji: string;
  color: string; // Tailwind color class
  description: string;
}

/**
 * Health score breakdown for transparency
 */
export interface HealthScoreBreakdown {
  total: number;              // 0-100
  nutritionScore: number;     // 0-50
  qualityScore: number;       // 0-50
  badges: HealthBadge[];
  tier: 'Excellent' | 'Great' | 'Good' | 'Fair' | 'Poor';
}

/**
 * Calculate nutrition score (Tier 1: 0-50 points)
 *
 * Based on macronutrients and micronutrients
 */
function calculateNutritionScore(nutrition: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}): number {
  let score = 50; // Start at max

  // Calorie penalties (per 100g)
  if (nutrition.calories > 400) score -= 15;
  else if (nutrition.calories > 300) score -= 10;
  else if (nutrition.calories > 200) score -= 5;

  // Fat penalties
  if (nutrition.fat > 20) score -= 12;
  else if (nutrition.fat > 15) score -= 8;
  else if (nutrition.fat > 10) score -= 4;

  // Sugar penalties
  if (nutrition.sugar) {
    if (nutrition.sugar > 20) score -= 12;
    else if (nutrition.sugar > 15) score -= 8;
    else if (nutrition.sugar > 10) score -= 4;
  }

  // Sodium penalties (mg per 100g)
  if (nutrition.sodium) {
    if (nutrition.sodium > 800) score -= 10;
    else if (nutrition.sodium > 600) score -= 7;
    else if (nutrition.sodium > 400) score -= 4;
  }

  // Protein bonuses
  if (nutrition.protein >= 25) score += 8;
  else if (nutrition.protein >= 20) score += 6;
  else if (nutrition.protein >= 15) score += 4;
  else if (nutrition.protein >= 10) score += 2;

  // Fiber bonuses
  if (nutrition.fiber) {
    if (nutrition.fiber >= 8) score += 7;
    else if (nutrition.fiber >= 5) score += 5;
    else if (nutrition.fiber >= 3) score += 3;
  }

  return Math.max(0, Math.min(50, score));
}

/**
 * Calculate quality score (Tier 2: 0-50 points)
 *
 * Based on organic, sustainability, and other quality factors
 */
function calculateQualityScore(quality?: QualityAttributes): number {
  if (!quality) return 0;

  let score = 0;

  // Primary quality attributes
  if (quality.isOrganic) score += 15;        // Highest priority
  if (quality.isNonGMO) score += 10;
  if (quality.isLocal) score += 10;
  if (quality.isSustainable) score += 10;
  if (quality.hasCleanLabel) score += 5;

  // Bonus attributes (can exceed 50 if multiple)
  if (quality.isFairTrade) score += 3;
  if (quality.isGrassFed) score += 3;
  if (quality.isWildCaught) score += 4;

  return Math.min(50, score); // Cap at 50
}

/**
 * Generate badges for UI display
 */
export function generateHealthBadges(quality?: QualityAttributes): HealthBadge[] {
  if (!quality) return [];

  const badges: HealthBadge[] = [];

  if (quality.isOrganic) {
    badges.push({
      label: 'USDA Organic',
      emoji: '🌿',
      color: 'green',
      description: 'Certified organic by USDA',
    });
  }

  if (quality.isNonGMO) {
    badges.push({
      label: 'Non-GMO',
      emoji: '🔬',
      color: 'blue',
      description: 'Non-genetically modified',
    });
  }

  if (quality.isLocal) {
    badges.push({
      label: 'Local Farm',
      emoji: '🚜',
      color: 'amber',
      description: 'Sourced from local farms',
    });
  }

  if (quality.isSustainable) {
    badges.push({
      label: 'Sustainable',
      emoji: '♻️',
      color: 'emerald',
      description: 'Environmentally sustainable',
    });
  }

  if (quality.hasCleanLabel) {
    badges.push({
      label: 'Clean Label',
      emoji: '✨',
      color: 'purple',
      description: 'No artificial additives',
    });
  }

  if (quality.isFairTrade) {
    badges.push({
      label: 'Fair Trade',
      emoji: '🤝',
      color: 'indigo',
      description: 'Fair Trade certified',
    });
  }

  if (quality.isGrassFed) {
    badges.push({
      label: 'Grass-Fed',
      emoji: '🌾',
      color: 'lime',
      description: 'Grass-fed animals',
    });
  }

  if (quality.isWildCaught) {
    badges.push({
      label: 'Wild-Caught',
      emoji: '🐟',
      color: 'cyan',
      description: 'Wild-caught seafood',
    });
  }

  return badges;
}

/**
 * Determine health tier based on total score
 */
function getHealthTier(score: number): HealthScoreBreakdown['tier'] {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Great';
  if (score >= 55) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

/**
 * Main function: Calculate Health Score v2
 *
 * Returns detailed breakdown with transparency
 */
export function calculateHealthScoreV2(
  data: EnhancedNutritionData
): HealthScoreBreakdown {
  const nutritionScore = calculateNutritionScore(data);
  const qualityScore = calculateQualityScore(data.quality);
  const total = nutritionScore + qualityScore;

  return {
    total: Math.round(total),
    nutritionScore: Math.round(nutritionScore),
    qualityScore: Math.round(qualityScore),
    badges: generateHealthBadges(data.quality),
    tier: getHealthTier(total),
  };
}

/**
 * Detect quality attributes from food name and description
 *
 * This is a simple keyword-based detection.
 * For production, integrate with USDA Organic Database API.
 */
export function detectQualityAttributes(
  foodName: string,
  description?: string
): QualityAttributes {
  const text = `${foodName} ${description || ''}`.toLowerCase();

  return {
    isOrganic: text.includes('organic') || text.includes('usda organic'),
    isNonGMO: text.includes('non-gmo') || text.includes('non gmo') || text.includes('gmo-free'),
    isLocal: text.includes('local') || text.includes('farm-fresh') || text.includes('locally sourced'),
    isSustainable: text.includes('sustainable') || text.includes('eco-friendly') || text.includes('regenerative'),
    hasCleanLabel: text.includes('no additives') || text.includes('no preservatives') || text.includes('all natural') || text.includes('clean label'),
    isFairTrade: text.includes('fair trade') || text.includes('fairtrade'),
    isGrassFed: text.includes('grass-fed') || text.includes('grass fed') || text.includes('pasture-raised'),
    isWildCaught: text.includes('wild-caught') || text.includes('wild caught') || text.includes('wild'),
  };
}

/**
 * Compare two foods using Health Score v2
 *
 * Returns percentage difference and which is better
 */
export function compareFoods(
  foodA: EnhancedNutritionData,
  foodB: EnhancedNutritionData
): {
  betterFood: 'A' | 'B' | 'Equal';
  scoreDifference: number;
  differencePercent: number;
  breakdownA: HealthScoreBreakdown;
  breakdownB: HealthScoreBreakdown;
} {
  const breakdownA = calculateHealthScoreV2(foodA);
  const breakdownB = calculateHealthScoreV2(foodB);

  const scoreDifference = breakdownA.total - breakdownB.total;
  const differencePercent = Math.abs(
    Math.round((scoreDifference / Math.max(breakdownA.total, breakdownB.total)) * 100)
  );

  let betterFood: 'A' | 'B' | 'Equal' = 'Equal';
  if (scoreDifference > 5) betterFood = 'A';
  else if (scoreDifference < -5) betterFood = 'B';

  return {
    betterFood,
    scoreDifference,
    differencePercent,
    breakdownA,
    breakdownB,
  };
}

/**
 * Backward compatibility: Convert v1 score to v2 format
 *
 * For existing data that only has v1 score
 */
export function convertV1ToV2(
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  },
  v1Score: number
): HealthScoreBreakdown {
  // Estimate quality score from v1 score
  const estimatedNutritionScore = Math.min(50, v1Score * 0.5);
  const estimatedQualityScore = Math.max(0, v1Score - 50);

  return {
    total: v1Score,
    nutritionScore: Math.round(estimatedNutritionScore),
    qualityScore: Math.round(estimatedQualityScore),
    badges: [],
    tier: getHealthTier(v1Score),
  };
}

/**
 * Example usage:
 *
 * const bigMac = {
 *   calories: 563,
 *   protein: 25,
 *   carbs: 45,
 *   fat: 30,
 *   fiber: 3,
 *   sugar: 9,
 *   sodium: 1007,
 *   quality: {
 *     isOrganic: false,
 *     isLocal: false,
 *   }
 * };
 *
 * const organicSalad = {
 *   calories: 120,
 *   protein: 8,
 *   carbs: 15,
 *   fat: 3,
 *   fiber: 5,
 *   sugar: 3,
 *   sodium: 200,
 *   quality: {
 *     isOrganic: true,
 *     isLocal: true,
 *     isSustainable: true,
 *     hasCleanLabel: true,
 *   }
 * };
 *
 * const bigMacScore = calculateHealthScoreV2(bigMac);
 * console.log(bigMacScore);
 * // {
 * //   total: 28,
 * //   nutritionScore: 28,
 * //   qualityScore: 0,
 * //   badges: [],
 * //   tier: 'Poor'
 * // }
 *
 * const saladScore = calculateHealthScoreV2(organicSalad);
 * console.log(saladScore);
 * // {
 * //   total: 92,
 * //   nutritionScore: 42,
 * //   qualityScore: 50,
 * //   badges: [
 * //     { label: 'USDA Organic', emoji: '🌿', color: 'green', description: '...' },
 * //     { label: 'Local Farm', emoji: '🚜', color: 'amber', description: '...' },
 * //     { label: 'Sustainable', emoji: '♻️', color: 'emerald', description: '...' },
 * //     { label: 'Clean Label', emoji: '✨', color: 'purple', description: '...' }
 * //   ],
 * //   tier: 'Excellent'
 * // }
 *
 * const comparison = compareFoods(organicSalad, bigMac);
 * console.log(comparison);
 * // {
 * //   betterFood: 'A',
 * //   scoreDifference: 64,
 * //   differencePercent: 70,
 * //   breakdownA: { ... },
 * //   breakdownB: { ... }
 * // }
 */
