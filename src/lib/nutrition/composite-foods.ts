/**
 * 복합 음식 영양소 계산 시스템
 *
 * 집밥/레스토랑 음식의 정확한 영양 정보 계산
 * - 재료 분해
 * - 서빙 사이즈 추정
 * - 영양소 합산
 *
 * 예: 파스타 = 면(200g) + 토마토 소스(100g) + 바질(5g)
 *     → 총 305g, 403 kcal
 */

import { searchFood, NutritionData } from './usda';
import { calculateHealthScore } from '@/lib/utils';

/**
 * 재료별 예상 무게 (g)
 *
 * 프로 셰프 + 영양학자 데이터 기반
 */
const INGREDIENT_WEIGHTS: Record<string, number> = {
  // 주식 (Carbs)
  'pasta': 200,
  'spaghetti': 200,
  'spaghetti pasta': 200,
  'penne': 200,
  'fettuccine': 200,
  'rice': 150,
  'white rice': 150,
  'brown rice': 150,
  'bread': 60,
  'tortilla': 50,
  'noodles': 180,

  // 단백질
  'chicken breast': 150,
  'grilled chicken': 150,
  'beef': 150,
  'steak': 200,
  'pork': 150,
  'fish': 150,
  'salmon': 150,
  'tuna': 120,
  'shrimp': 100,
  'tofu': 150,
  'eggs': 100, // 2개

  // 소스/드레싱
  'tomato sauce': 100,
  'marinara sauce': 100,
  'alfredo sauce': 80,
  'pesto': 30,
  'soy sauce': 15,
  'olive oil': 15,
  'butter': 10,
  'cream': 50,
  'cheese': 30,
  'parmesan': 20,
  'parmesan cheese': 20,
  'mozzarella': 50,

  // 야채
  'tomatoes': 100,
  'tomato': 100,
  'lettuce': 50,
  'onion': 50,
  'garlic': 10,
  'basil': 5,
  'fresh basil': 5,
  'spinach': 80,
  'broccoli': 100,
  'carrots': 80,
  'bell pepper': 80,
  'mushrooms': 60,

  // 기타
  'salt': 0, // 무시 (미미한 칼로리)
  'pepper': 0,
  'herbs': 2,
  'spices': 2,
};

/**
 * 서빙 사이즈 파싱
 * "1 plate (250g)" → 250
 * "200g" → 200
 * "1 burger" → null (브랜드 검색 필요)
 */
function parseServingSize(servingSize?: string): number | null {
  if (!servingSize) return null;

  // "250g" 또는 "(250g)" 패턴
  const match = servingSize.match(/(\d+)\s*g/);
  if (match) {
    return parseInt(match[1]);
  }

  // "1 plate" 등 → 기본 250g
  if (servingSize.includes('plate') || servingSize.includes('bowl')) {
    return 250;
  }

  return null;
}

/**
 * 재료명 정규화
 * "spaghetti pasta" → "pasta"
 * "fresh basil" → "basil"
 */
function normalizeIngredient(ingredient: string): string {
  const normalized = ingredient.toLowerCase().trim();

  // 정확한 매칭 우선
  if (INGREDIENT_WEIGHTS[normalized]) {
    return normalized;
  }

  // 부분 매칭 (예: "fresh basil" → "basil")
  for (const key of Object.keys(INGREDIENT_WEIGHTS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return key;
    }
  }

  return normalized;
}

/**
 * USDA 검색 쿼리 준비 (조리된 상태로 검색)
 *
 * "pasta" → "pasta cooked"
 * "rice" → "rice cooked"
 * "tomato sauce" → "tomato sauce" (그대로)
 */
function prepareIngredientSearchQuery(ingredient: string): string {
  const ingredientLower = ingredient.toLowerCase();

  // 조리가 필요한 재료들
  const needsCookedKeyword = [
    'pasta',
    'spaghetti',
    'penne',
    'fettuccine',
    'noodles',
    'rice',
    'quinoa',
    'lentils',
    'beans',
  ];

  // 이미 "cooked" 포함되어 있으면 그대로
  if (ingredientLower.includes('cooked')) {
    return ingredient;
  }

  // 조리 필요한 재료인지 확인
  for (const keyword of needsCookedKeyword) {
    if (ingredientLower.includes(keyword)) {
      return `${ingredient} cooked`;
    }
  }

  // 나머지는 그대로 검색
  return ingredient;
}

/**
 * 재료별 예상 무게 반환
 */
function estimateIngredientWeight(ingredient: string): number {
  const normalized = normalizeIngredient(ingredient);
  return INGREDIENT_WEIGHTS[normalized] || 100; // 기본 100g
}

/**
 * 복합 음식 영양소 계산
 *
 * @param ingredients - 재료 리스트 ["pasta", "tomato sauce", "basil"]
 * @param servingSize - 전체 서빙 사이즈 "1 plate (250g)"
 * @returns 합산된 영양 정보
 */
export async function calculateCompositeNutrition(
  ingredients: string[],
  servingSize?: string
): Promise<NutritionData> {
  const startTime = Date.now();

  try {
    console.log(`[Composite] Calculating nutrition for: ${ingredients.join(', ')}`);

    // 1. 전체 서빙 사이즈 파싱
    const totalWeight = parseServingSize(servingSize);

    // 2. 재료별 영양소 검색
    const ingredientData: Array<{ ingredient: string; data: NutritionData; weight: number }> = [];

    for (const ingredient of ingredients) {
      // 무시할 재료 (salt, pepper 등)
      const normalized = normalizeIngredient(ingredient);
      const estimatedWeight = estimateIngredientWeight(ingredient);

      if (estimatedWeight === 0) {
        console.log(`[Composite] Skipping: ${ingredient} (negligible)`);
        continue;
      }

      // USDA 검색 시 조리된 상태로 검색 (pasta, rice 등)
      const searchQuery = prepareIngredientSearchQuery(ingredient);
      const results = await searchFood(searchQuery);

      if (results.length === 0) {
        console.log(`[Composite] No data found for: ${ingredient}`);
        continue;
      }

      // 가장 정확한 결과 선택
      const best = selectBestIngredientMatch(results, ingredient);

      ingredientData.push({
        ingredient,
        data: best,
        weight: estimatedWeight,
      });

      console.log(`[Composite] ${ingredient}: ${estimatedWeight}g → ${Math.round(best.calories * estimatedWeight / 100)} kcal`);
    }

    // 3. 영양소 합산
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;

    for (const { data, weight } of ingredientData) {
      // 100g 기준 → 실제 무게로 환산
      const ratio = weight / 100;

      totalCalories += data.calories * ratio;
      totalProtein += data.protein * ratio;
      totalCarbs += data.carbs * ratio;
      totalFat += data.fat * ratio;
      totalFiber += data.fiber * ratio;
      totalSugar += data.sugar * ratio;
      totalSodium += data.sodium * ratio;
    }

    // 4. 결과 생성
    const compositeNutrition: NutritionData = {
      name: `${ingredients.join(' + ')} (Homemade)`,
      brand: undefined,
      fdcId: 0, // 복합 음식은 ID 없음
      servingSize: totalWeight || ingredientData.reduce((sum, item) => sum + item.weight, 0),
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10,
      sugar: Math.round(totalSugar * 10) / 10,
      sodium: Math.round(totalSodium),
      healthScore: calculateHealthScore({
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        fiber: totalFiber,
        sugar: totalSugar,
        sodium: totalSodium,
      }),
      dataType: 'Composite',
      cached: false,
    };

    const duration = Date.now() - startTime;
    console.log(`[Composite] Total: ${compositeNutrition.calories} kcal (${duration}ms)`);

    return compositeNutrition;

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Composite] Calculation failed (${duration}ms):`, error);
    throw error;
  }
}

/**
 * 재료별 가장 정확한 데이터 선택
 *
 * 우선순위:
 * 1. "cooked" 상태 우선
 * 2. 단순한 이름 (예: "pasta" > "pasta salad")
 * 3. Foundation 데이터 우선 (기본 식재료)
 */
function selectBestIngredientMatch(
  results: NutritionData[],
  ingredient: string
): NutritionData {
  if (results.length === 1) return results[0];

  const normalized = ingredient.toLowerCase();

  const scored = results.map((item) => {
    let score = 0;
    const nameLower = item.name.toLowerCase();

    // 1. "cooked" 상태 우선 (+30점)
    if (normalized.includes('pasta') || normalized.includes('rice') || normalized.includes('noodle')) {
      if (nameLower.includes('cooked')) score += 30;
    }

    // 2. 정확한 매칭 (+40점)
    if (nameLower === normalized) score += 40;
    else if (nameLower.includes(normalized) || normalized.includes(nameLower)) score += 20;

    // 3. 단순한 이름 우선 (단어 수 적을수록 +점수)
    const wordCount = nameLower.split(/\s+/).length;
    score += Math.max(0, 20 - wordCount * 2); // 1단어: +18, 2단어: +16, ...

    // 4. Foundation 데이터 우선 (+15점)
    if (item.dataType === 'Foundation') score += 15;
    else if (item.dataType === 'Survey (FNDDS)') score += 10;

    // 5. 너무 낮은 칼로리 제외 (소스, 드레싱 제외용)
    if (item.calories < 10) score -= 50;

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  console.log(
    `[IngredientMatch] "${ingredient}" → "${scored[0].item.name}" (score: ${scored[0].score})`
  );

  return scored[0].item;
}

/**
 * 복합 음식 여부 감지
 */
export function isCompositeFoodCandidate(
  foodName: string,
  isHomemade?: boolean,
  ingredients?: string[]
): boolean {
  // 명시적으로 집밥 표시
  if (isHomemade === true) return true;

  // 재료 리스트 있으면 복합 음식
  if (ingredients && ingredients.length > 1) return true;

  // 브랜드 없는 복합 키워드
  const compositeKeywords = [
    'with', 'and', '+', 'pasta', 'salad', 'bowl',
    'plate', 'homemade', 'mixed', 'stir fry'
  ];

  const nameLower = foodName.toLowerCase();
  return compositeKeywords.some(keyword => nameLower.includes(keyword));
}

/**
 * 자동 재료 추정 (AI가 ingredients를 반환하지 않을 때)
 *
 * 음식명으로 일반적인 재료 구성 추정
 */
export function estimateIngredientsFromName(foodName: string): string[] | null {
  const nameLower = foodName.toLowerCase();

  // 파스타류
  if (nameLower.includes('spaghetti') || nameLower.includes('pasta')) {
    if (nameLower.includes('marinara')) {
      return ['spaghetti pasta', 'marinara sauce', 'olive oil', 'basil'];
    }
    if (nameLower.includes('alfredo')) {
      return ['fettuccine', 'alfredo sauce', 'parmesan cheese'];
    }
    if (nameLower.includes('carbonara')) {
      return ['spaghetti pasta', 'cream', 'parmesan cheese', 'eggs'];
    }
    if (nameLower.includes('pesto')) {
      return ['penne', 'pesto', 'parmesan cheese'];
    }
    // 기본 파스타 (토마토 + 바질)
    if (nameLower.includes('tomato') || nameLower.includes('basil')) {
      return ['spaghetti pasta', 'tomato sauce', 'olive oil', 'basil'];
    }
    return ['spaghetti pasta', 'tomato sauce', 'olive oil'];
  }

  // 샐러드류
  if (nameLower.includes('salad')) {
    if (nameLower.includes('caesar')) {
      return ['lettuce', 'parmesan cheese', 'croutons', 'caesar dressing'];
    }
    if (nameLower.includes('greek')) {
      return ['lettuce', 'tomato', 'cucumber', 'feta cheese', 'olive oil'];
    }
    return ['lettuce', 'tomato', 'cucumber', 'olive oil'];
  }

  // 밥류
  if (nameLower.includes('rice') && nameLower.includes('bowl')) {
    if (nameLower.includes('chicken')) {
      return ['white rice', 'grilled chicken', 'vegetables'];
    }
    if (nameLower.includes('beef')) {
      return ['white rice', 'beef', 'vegetables'];
    }
    return ['white rice', 'vegetables'];
  }

  // 볶음류
  if (nameLower.includes('stir fry')) {
    if (nameLower.includes('chicken')) {
      return ['chicken breast', 'vegetables', 'soy sauce', 'rice'];
    }
    return ['vegetables', 'soy sauce', 'rice'];
  }

  // 추정 불가
  return null;
}

/**
 * 레스토랑/집밥 음식 감지 (브랜드 제외)
 *
 * USDA에서 냉동식품 브랜드가 선택되는 것을 방지
 */
export function isRestaurantOrHomemade(foodName: string): boolean {
  const nameLower = foodName.toLowerCase();

  // 확실한 브랜드 키워드 (이것들만 USDA 직접 검색)
  const brandKeywords = [
    'big mac',
    'whopper',
    'quarter pounder',
    "mcdonald's",
    'burger king',
    'subway',
    'kfc',
    'taco bell',
    'wendy\'s',
    'chipotle',
  ];

  // 브랜드명이 명확하면 false (USDA 직접 검색)
  if (brandKeywords.some(brand => nameLower.includes(brand))) {
    return false;
  }

  // 레스토랑/집밥 키워드 (복합 음식으로 처리)
  const homemadeKeywords = [
    'pasta',
    'spaghetti',
    'salad',
    'bowl',
    'plate',
    'homemade',
    'with',
    'and',
    'marinara',
    'alfredo',
    'carbonara',
    'pesto',
    'stir fry',
    'fried rice',
  ];

  return homemadeKeywords.some(keyword => nameLower.includes(keyword));
}
