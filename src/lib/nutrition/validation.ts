/**
 * 영양 정보 검증 시스템
 *
 * 목적: USDA 데이터의 정확도 검증
 * 방법:
 * 1. 미리 정의된 음식별 평균 영양소 (웹 검색 결과 기반)
 * 2. 차이가 20% 이상이면 경고
 * 3. 사용자 피드백 수집
 */

import { NutritionData } from './usda';

/**
 * 주요 음식 평균 영양소 (100g 기준)
 * 출처: USDA, MyFitnessPal, Nutritionix 평균값
 */
const REFERENCE_NUTRITION: Record<string, Partial<NutritionData>> = {
  // 패스트푸드 (브랜드)
  'big mac': {
    calories: 550,
    protein: 25,
    carbs: 46,
    fat: 30,
    servingSize: 219, // 1 burger
  },
  'whopper': {
    calories: 660,
    protein: 28,
    carbs: 49,
    fat: 40,
    servingSize: 290,
  },
  'quarter pounder': {
    calories: 520,
    protein: 30,
    carbs: 41,
    fat: 26,
    servingSize: 194,
  },

  // 파스타 (집밥)
  'spaghetti marinara': {
    calories: 200, // 100g 기준
    protein: 7,
    carbs: 40,
    fat: 3,
    servingSize: 200, // 1 plate
  },
  'spaghetti': {
    calories: 158, // cooked pasta only
    protein: 5.8,
    carbs: 30.9,
    fat: 0.9,
    servingSize: 100,
  },
  'pasta': {
    calories: 158,
    protein: 5.8,
    carbs: 30.9,
    fat: 0.9,
    servingSize: 100,
  },

  // 피자
  'pepperoni pizza': {
    calories: 280,
    protein: 12,
    carbs: 30,
    fat: 12,
    servingSize: 100,
  },
  'margherita pizza': {
    calories: 240,
    protein: 10,
    carbs: 28,
    fat: 10,
    servingSize: 100,
  },

  // 치킨
  'fried chicken': {
    calories: 320,
    protein: 23,
    carbs: 12,
    fat: 21,
    servingSize: 100,
  },
  'grilled chicken': {
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    servingSize: 100,
  },

  // 샐러드
  'caesar salad': {
    calories: 180,
    protein: 8,
    carbs: 6,
    fat: 15,
    servingSize: 100,
  },
  'greek salad': {
    calories: 105,
    protein: 4,
    carbs: 7,
    fat: 7,
    servingSize: 100,
  },

  // 기본 재료
  'tomato sauce': {
    calories: 24,
    protein: 1.3,
    carbs: 4.4,
    fat: 0.5,
    servingSize: 100,
  },
  'olive oil': {
    calories: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    servingSize: 100,
  },
  'basil': {
    calories: 23,
    protein: 3.2,
    carbs: 2.7,
    fat: 0.6,
    servingSize: 100,
  },
};

export interface ValidationResult {
  isValid: boolean;
  confidence: number; // 0-100 (100 = 완벽히 일치)
  warnings: string[];
  differences: {
    calories: number; // % 차이
    protein: number;
    carbs: number;
    fat: number;
  };
  referenceSource: string; // "USDA Average", "MyFitnessPal", etc.
}

/**
 * 영양 정보 검증
 */
export function validateNutrition(
  foodName: string,
  actualNutrition: NutritionData
): ValidationResult {
  const nameLower = foodName.toLowerCase();

  // 1. 참조 데이터 찾기
  let reference: Partial<NutritionData> | undefined;

  // 정확한 매칭
  if (REFERENCE_NUTRITION[nameLower]) {
    reference = REFERENCE_NUTRITION[nameLower];
  } else {
    // 부분 매칭
    for (const [key, value] of Object.entries(REFERENCE_NUTRITION)) {
      if (nameLower.includes(key) || key.includes(nameLower)) {
        reference = value;
        break;
      }
    }
  }

  // 참조 데이터 없으면 검증 불가
  if (!reference || !reference.calories) {
    return {
      isValid: true,
      confidence: 75, // 기본 신뢰도
      warnings: [],
      differences: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      referenceSource: 'No Reference Data',
    };
  }

  // 2. 차이 계산
  const caloriesDiff = calculatePercentageDiff(
    actualNutrition.calories,
    reference.calories!
  );
  const proteinDiff = reference.protein
    ? calculatePercentageDiff(actualNutrition.protein, reference.protein)
    : 0;
  const carbsDiff = reference.carbs
    ? calculatePercentageDiff(actualNutrition.carbs, reference.carbs)
    : 0;
  const fatDiff = reference.fat
    ? calculatePercentageDiff(actualNutrition.fat, reference.fat)
    : 0;

  // 3. 경고 생성
  const warnings: string[] = [];

  if (Math.abs(caloriesDiff) > 30) {
    warnings.push(
      `⚠️ Calories differ by ${Math.abs(Math.round(caloriesDiff))}% from typical ${foodName} (expected ~${reference.calories} kcal)`
    );
  }

  if (Math.abs(proteinDiff) > 30 && reference.protein) {
    warnings.push(
      `Protein content unusually ${proteinDiff > 0 ? 'high' : 'low'} (expected ~${reference.protein}g)`
    );
  }

  // 4. 신뢰도 점수
  const avgDiff = (Math.abs(caloriesDiff) + Math.abs(proteinDiff) + Math.abs(carbsDiff) + Math.abs(fatDiff)) / 4;
  const confidence = Math.max(0, Math.min(100, 100 - avgDiff));

  // 5. 검증 결과
  const isValid = Math.abs(caloriesDiff) < 30 && warnings.length === 0;

  return {
    isValid,
    confidence,
    warnings,
    differences: {
      calories: caloriesDiff,
      protein: proteinDiff,
      carbs: carbsDiff,
      fat: fatDiff,
    },
    referenceSource: 'Web Average (USDA + MyFitnessPal)',
  };
}

/**
 * 퍼센트 차이 계산
 */
function calculatePercentageDiff(actual: number, expected: number): number {
  if (expected === 0) return 0;
  return ((actual - expected) / expected) * 100;
}

/**
 * 사용자 피드백 저장
 */
export interface NutritionFeedback {
  foodName: string;
  fdcId: number;
  reportedCalories: number;
  actualCalories: number;
  userComment?: string;
  timestamp: Date;
}

const feedbackStore: NutritionFeedback[] = [];

export function submitNutritionFeedback(feedback: Omit<NutritionFeedback, 'timestamp'>): void {
  feedbackStore.push({
    ...feedback,
    timestamp: new Date(),
  });

  console.log(`[Validation] Feedback received for "${feedback.foodName}": ${feedback.reportedCalories} kcal reported vs ${feedback.actualCalories} kcal in DB`);

  // TODO: 나중에 데이터베이스에 저장
  // await prisma.nutritionFeedback.create({ data: feedback });
}

/**
 * 검증 결과 로깅
 */
export function logValidationResult(
  foodName: string,
  result: ValidationResult
): void {
  if (!result.isValid || result.warnings.length > 0) {
    console.warn(`[Validation] "${foodName}" validation:`, {
      confidence: `${result.confidence}%`,
      warnings: result.warnings,
      differences: result.differences,
    });
  } else {
    console.log(`[Validation] "${foodName}" validation: ✅ OK (${result.confidence}% confidence)`);
  }
}

/**
 * 참조 영양소 추가 (동적)
 *
 * 사용자 피드백 기반으로 참조 데이터 업데이트
 */
export function addReferenceNutrition(
  foodName: string,
  nutrition: Partial<NutritionData>
): void {
  REFERENCE_NUTRITION[foodName.toLowerCase()] = nutrition;
  console.log(`[Validation] Reference data added for "${foodName}"`);
}
