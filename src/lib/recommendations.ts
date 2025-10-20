/**
 * 대체품 추천 알고리즘
 *
 * 전략:
 * 1. 같은 카테고리에서 건강한 옵션 찾기
 * 2. 칼로리 20%+ 낮은 음식
 * 3. 건강 점수 10+ 높은 음식
 * 4. 만족도 유지 (유사한 음식)
 */

import { NutritionData, searchFood, searchMultipleFoods } from '@/lib/nutrition/usda';
import { calculateCaloriesSavedPercent } from '@/lib/utils';
import { FoodCategory } from '@/lib/ai/replicate';

export interface FoodAlternative {
  // 음식 정보
  name: string;
  brand?: string;
  fdcId: number;

  // 영양 정보
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;

  // 비교 지표
  caloriesSaved: number;
  caloriesSavedPercent: number;
  healthScoreImprovement: number;

  // 추천 이유
  reason: string;
  score: number; // 추천 점수 (0-100)
}

export interface RecommendationResult {
  original: NutritionData;
  alternatives: FoodAlternative[];
  totalOptions: number;
  responseTime: number;
}

/**
 * 대체품 추천 메인 함수
 */
export async function recommendAlternatives(
  foodName: string,
  category?: FoodCategory
): Promise<RecommendationResult> {
  const startTime = Date.now();

  try {
    // 1. 원본 음식 영양 정보
    const originalResults = await searchFood(foodName);

    if (originalResults.length === 0) {
      throw new Error(`Food not found: ${foodName}`);
    }

    const original = originalResults[0];

    // 2. 카테고리별 검색어 생성
    const searchQueries = generateSearchQueries(foodName, category);

    // 3. 대체품 후보 검색
    const candidatesMap = await searchMultipleFoods(searchQueries);
    const allCandidates: NutritionData[] = [];

    candidatesMap.forEach((results) => {
      allCandidates.push(...results);
    });

    // 4. 필터링 + 점수 계산
    const alternatives = allCandidates
      .filter((candidate) => {
        // 자기 자신 제외
        if (candidate.fdcId === original.fdcId) return false;

        // 칼로리가 20% 이상 낮아야 함
        const saved = original.calories - candidate.calories;
        return saved >= original.calories * 0.2;
      })
      .map((candidate) => {
        const caloriesSaved = original.calories - candidate.calories;
        const caloriesSavedPercent = calculateCaloriesSavedPercent(
          original.calories,
          candidate.calories
        );
        const healthScoreImprovement = candidate.healthScore - original.healthScore;

        // 추천 점수 계산
        const score = calculateRecommendationScore({
          caloriesSaved,
          healthScoreImprovement,
          proteinDiff: candidate.protein - original.protein,
          fiberDiff: candidate.fiber - original.fiber,
        });

        // 추천 이유 생성
        const reason = generateReason({
          caloriesSaved,
          caloriesSavedPercent,
          healthScoreImprovement,
          proteinDiff: candidate.protein - original.protein,
        });

        return {
          name: candidate.name,
          brand: candidate.brand,
          fdcId: candidate.fdcId,
          calories: candidate.calories,
          protein: candidate.protein,
          carbs: candidate.carbs,
          fat: candidate.fat,
          healthScore: candidate.healthScore,
          caloriesSaved,
          caloriesSavedPercent,
          healthScoreImprovement,
          reason,
          score,
        };
      })
      .sort((a, b) => b.score - a.score) // 점수 높은 순
      .slice(0, 5); // 상위 5개

    const responseTime = Date.now() - startTime;

    console.log(
      `[Recommendations] ${foodName} → ${alternatives.length} alternatives (${responseTime}ms)`
    );

    return {
      original,
      alternatives,
      totalOptions: allCandidates.length,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`[Recommendations] Failed (${responseTime}ms):`, error);
    throw error;
  }
}

/**
 * 카테고리별 검색어 생성
 */
function generateSearchQueries(foodName: string, category?: FoodCategory): string[] {
  const queries: string[] = [];

  // 카테고리별 헬시 옵션
  const categoryMap: Record<string, string[]> = {
    BURGER: ['grilled chicken burger', 'veggie burger', 'turkey burger'],
    PIZZA: ['thin crust pizza', 'vegetable pizza', 'margherita pizza'],
    SANDWICH: ['turkey sandwich', 'veggie sandwich', 'grilled chicken sandwich'],
    SALAD: ['chicken salad', 'greek salad', 'caesar salad'],
    PASTA: ['whole wheat pasta', 'marinara pasta', 'vegetable pasta'],
    CHICKEN: ['grilled chicken', 'baked chicken', 'chicken breast'],
    BEEF: ['lean beef', 'sirloin steak', 'ground turkey'],
    DESSERT: ['fruit salad', 'greek yogurt', 'frozen yogurt'],
    SNACK: ['nuts', 'fruit', 'vegetables', 'popcorn'],
    BEVERAGE: ['water', 'green tea', 'black coffee', 'sparkling water'],
  };

  if (category && categoryMap[category]) {
    queries.push(...categoryMap[category]);
  }

  // 일반 헬시 키워드
  queries.push(
    `low calorie ${foodName}`,
    `healthy ${foodName}`,
    `light ${foodName}`,
    'grilled chicken',
    'salad'
  );

  // 중복 제거
  return [...new Set(queries)];
}

/**
 * 추천 점수 계산 (0-100)
 */
function calculateRecommendationScore(params: {
  caloriesSaved: number;
  healthScoreImprovement: number;
  proteinDiff: number;
  fiberDiff: number;
}): number {
  let score = 50; // 기본 점수

  // 칼로리 절감 (최대 30점)
  score += Math.min(params.caloriesSaved / 10, 30);

  // 건강 점수 개선 (최대 20점)
  score += Math.min(params.healthScoreImprovement / 2, 20);

  // 단백질 증가 (최대 10점)
  if (params.proteinDiff > 0) {
    score += Math.min(params.proteinDiff, 10);
  }

  // 섬유질 증가 (최대 10점)
  if (params.fiberDiff > 0) {
    score += Math.min(params.fiberDiff * 2, 10);
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * 추천 이유 생성
 */
function generateReason(params: {
  caloriesSaved: number;
  caloriesSavedPercent: number;
  healthScoreImprovement: number;
  proteinDiff: number;
}): string {
  const reasons: string[] = [];

  // 칼로리 절감
  if (params.caloriesSaved > 0) {
    reasons.push(`${params.caloriesSavedPercent}% fewer calories`);
  }

  // 건강 점수
  if (params.healthScoreImprovement > 10) {
    reasons.push('much healthier');
  } else if (params.healthScoreImprovement > 0) {
    reasons.push('healthier option');
  }

  // 단백질
  if (params.proteinDiff > 5) {
    reasons.push('more protein');
  }

  // 기본 메시지
  if (reasons.length === 0) {
    reasons.push('healthier alternative');
  }

  // 첫 글자 대문자
  const result = reasons.join(', ');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * 빠른 추천 (사전 정의된 매핑)
 *
 * AI 인식 후 즉시 추천 가능 (USDA API 호출 없이)
 */
export const QUICK_RECOMMENDATIONS: Record<string, string[]> = {
  'big mac': ['grilled chicken sandwich', 'turkey burger', 'veggie burger'],
  'whopper': ['grilled chicken whopper', 'impossible whopper', 'turkey burger'],
  'french fries': ['side salad', 'apple slices', 'carrots'],
  'chicken nuggets': ['grilled chicken strips', 'grilled chicken salad'],
  'pizza': ['thin crust vegetable pizza', 'margherita pizza'],
  'soda': ['water', 'sparkling water', 'unsweetened iced tea'],
  'milkshake': ['smoothie', 'protein shake', 'greek yogurt'],
};
