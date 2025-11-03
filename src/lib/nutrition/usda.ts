/**
 * USDA FoodData Central API
 *
 * 무료 영양 데이터베이스:
 * - 300,000+ 음식
 * - Rate limit: 1,000 requests/hour
 * - 비용: $0
 *
 * https://fdc.nal.usda.gov/api-guide.html
 */

import { getCached, setCached, CacheKeys, CacheTTL } from '@/lib/redis';
import { calculateHealthScore } from '@/lib/utils';
import {
  calculateHealthScoreV2,
  detectQualityAttributes,
  type QualityAttributes,
  type HealthScoreBreakdown,
} from './health-score-v2';

const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = process.env.USDA_API_KEY;

export interface NutritionData {
  name: string;
  brand?: string;
  fdcId: number; // USDA Food ID

  // 영양 정보 (per 100g)
  servingSize: number; // grams
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number; // mg

  // 건강 점수 v1 (backward compatibility)
  healthScore: number; // 0-100

  // 건강 점수 v2 (NEW)
  quality?: QualityAttributes;
  healthScoreV2?: HealthScoreBreakdown;

  // 메타데이터
  dataType: string;
  cached: boolean;
}

/**
 * 음식 이름으로 검색 (캐싱 적용)
 */
export async function searchFood(query: string): Promise<NutritionData[]> {
  const startTime = Date.now();

  try {
    // 1. 캐시 확인
    const cacheKey = CacheKeys.usdaFood(query);
    const cached = await getCached<NutritionData[]>(cacheKey);

    if (cached) {
      console.log(`[USDA] Cache HIT: ${query} (${Date.now() - startTime}ms)`);
      return cached.map((item) => ({ ...item, cached: true }));
    }

    // 2. USDA API 호출
    console.log(`[USDA] Cache MISS: Searching for "${query}"`);

    const response = await fetch(
      `${USDA_API_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=5&api_key=${USDA_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.foods || data.foods.length === 0) {
      console.log(`[USDA] No results for: ${query}`);
      return [];
    }

    // 3. 데이터 파싱
    const results = data.foods
      .slice(0, 5)
      .map((food: any) => parseUSDAFood(food))
      .filter((item: NutritionData | null) => item !== null);

    // 4. 캐시 저장 (30일)
    await setCached(cacheKey, results, CacheTTL.USDA_DATA);

    const duration = Date.now() - startTime;
    console.log(`[USDA] Found ${results.length} results for "${query}" (${duration}ms)`);

    return results;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[USDA] Search failed (${duration}ms):`, error);
    throw error;
  }
}

/**
 * USDA 음식 데이터 파싱
 */
function parseUSDAFood(food: any): NutritionData | null {
  try {
    // 영양소 맵
    const nutrientMap: Record<string, number> = {};
    food.foodNutrients?.forEach((nutrient: any) => {
      nutrientMap[nutrient.nutrientId] = nutrient.value;
    });

    // 주요 영양소 (Nutrient IDs)
    const calories = nutrientMap[1008] || 0; // Energy (kcal)
    const protein = nutrientMap[1003] || 0; // Protein (g)
    const carbs = nutrientMap[1005] || 0; // Carbohydrate (g)
    const fat = nutrientMap[1004] || 0; // Total lipid (fat) (g)
    const fiber = nutrientMap[1079] || 0; // Fiber (g)
    const sugar = nutrientMap[2000] || 0; // Sugars (g)
    const sodium = nutrientMap[1093] || 0; // Sodium (mg)

    // 건강 점수 v1 계산 (backward compatibility)
    const healthScore = calculateHealthScore({
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
    });

    // 품질 속성 감지 (v2)
    const quality = detectQualityAttributes(
      food.description,
      food.ingredients || food.brandName
    );

    // 건강 점수 v2 계산
    const healthScoreV2 = calculateHealthScoreV2({
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      quality,
    });

    return {
      name: food.description,
      brand: food.brandName || food.brandOwner,
      fdcId: food.fdcId,
      servingSize: 100, // USDA는 100g 기준
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      fiber: Math.round(fiber * 10) / 10,
      sugar: Math.round(sugar * 10) / 10,
      sodium: Math.round(sodium),
      healthScore, // v1 (backward compatibility)
      quality,
      healthScoreV2,
      dataType: food.dataType,
      cached: false,
    };
  } catch (error) {
    console.error('[USDA] Failed to parse food:', error);
    return null;
  }
}

/**
 * FDC ID로 상세 정보 조회
 */
export async function getFoodById(fdcId: number): Promise<NutritionData | null> {
  try {
    const response = await fetch(
      `${USDA_API_URL}/food/${fdcId}?api_key=${USDA_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.statusText}`);
    }

    const data = await response.json();
    return parseUSDAFood(data);
  } catch (error) {
    console.error('[USDA] Get by ID failed:', error);
    return null;
  }
}

/**
 * 여러 음식 검색 (배치)
 */
export async function searchMultipleFoods(
  queries: string[]
): Promise<Map<string, NutritionData[]>> {
  const results = new Map<string, NutritionData[]>();

  // 병렬 실행 (최대 5개)
  const chunks = queries.slice(0, 5);
  const promises = chunks.map(async (query) => {
    const data = await searchFood(query);
    results.set(query, data);
  });

  await Promise.all(promises);

  return results;
}

/**
 * 인기 음식 미리 캐싱
 */
export async function preCachePopularFoods() {
  const popularFoods = [
    'big mac',
    'whopper',
    'pizza',
    'french fries',
    'chicken nuggets',
    'salad',
    'subway sandwich',
    'taco',
    'burrito',
    'pasta',
  ];

  console.log('[USDA] Pre-caching popular foods...');

  for (const food of popularFoods) {
    try {
      await searchFood(food);
      // Rate limit 준수 (1초 대기)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[USDA] Pre-cache failed for "${food}":`, error);
    }
  }

  console.log('[USDA] Pre-caching completed');
}
