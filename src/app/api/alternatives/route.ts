/**
 * POST /api/alternatives
 *
 * 건강한 대체품 추천 API
 *
 * Request:
 * {
 *   "foodName": "Big Mac",
 *   "category": "BURGER"
 * }
 *
 * Response:
 * {
 *   "original": { ... },
 *   "alternatives": [
 *     {
 *       "name": "Grilled Chicken Sandwich",
 *       "caloriesSaved": 180,
 *       "caloriesSavedPercent": 32,
 *       "reason": "32% fewer calories, more protein",
 *       "score": 85
 *     }
 *   ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { recommendAlternatives } from '@/lib/recommendations';
import { FoodCategory } from '@/lib/ai/replicate';
import { getErrorMessage } from '@/lib/utils';
import { findRealFoodNutrition, getHealthyAlternatives } from '@/lib/nutrition/real-food-database';
import { calculateHealthScoreV2 } from '@/lib/nutrition/health-score-v2';

// Using Node runtime for file system access
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. 요청 파싱
    const body = await req.json();
    const { foodName, category, ingredients, servingSize, isHomemade } = body;

    if (!foodName) {
      return NextResponse.json(
        { error: 'foodName is required' },
        { status: 400 }
      );
    }

    // 2. 실제 음식 데이터베이스에서 먼저 확인
    const realFood = findRealFoodNutrition(foodName);

    if (realFood) {
      // 실제 음식 데이터베이스에서 찾음 → 3개 건강한 대체품 추천
      const alternatives = getHealthyAlternatives(realFood);

      console.log(
        `[API] /alternatives: ${foodName} → ${alternatives.length} alternatives from REAL FOOD DATABASE`
      );

      const result = {
        original: {
          name: realFood.name,
          brand: realFood.brand,
          serving: realFood.serving,
          calories: realFood.calories,
          protein: realFood.protein,
          carbs: realFood.carbs,
          fat: realFood.fat,
          sugar: realFood.sugar,
          fiber: realFood.fiber,
          sodium: realFood.sodium,
          healthScoreV2: calculateHealthScoreV2({
            calories: realFood.calories,
            protein: realFood.protein,
            carbs: realFood.carbs,
            fat: realFood.fat,
            sugar: realFood.sugar,
            fiber: realFood.fiber,
            sodium: realFood.sodium,
            isOrganic: realFood.isOrganic,
            keywords: [realFood.name, realFood.brand || '', realFood.category],
          }),
        },
        alternatives: alternatives.map((alt) => {
          const caloriesSaved = realFood.calories - alt.calories;
          const caloriesSavedPercent = Math.round((caloriesSaved / realFood.calories) * 100);

          return {
            name: alt.name,
            brand: alt.brand,
            serving: alt.serving,
            servingWeight: alt.servingWeight,
            calories: alt.calories,
            protein: alt.protein,
            carbs: alt.carbs,
            fat: alt.fat,
            sugar: alt.sugar,
            fiber: alt.fiber,
            sodium: alt.sodium,
            healthScoreV2: calculateHealthScoreV2({
              calories: alt.calories,
              protein: alt.protein,
              carbs: alt.carbs,
              fat: alt.fat,
              sugar: alt.sugar,
              fiber: alt.fiber,
              sodium: alt.sodium,
              isOrganic: alt.isOrganic,
              keywords: [alt.name, alt.brand || '', alt.category],
            }),
            caloriesSaved,
            caloriesSavedPercent,
            reason: `${caloriesSavedPercent}% fewer calories${alt.isOrganic ? ', organic' : ''}${alt.isHealthy ? ', healthy option' : ''}`,
            source: alt.source,
            category: alt.category,
            isOrganic: alt.isOrganic,
            isHealthy: alt.isHealthy,
            dataSource: 'real-food-database' as const,
          };
        }),
        dataSource: 'real-food-database' as const,
      };

      const responseTime = Date.now() - startTime;

      return NextResponse.json({
        ...result,
        responseTime,
      });
    }

    // 3. USDA 대체품 추천 (fallback)
    console.log(
      `[API] /alternatives: ${foodName} → Fallback to USDA alternatives`
    );

    const result = await recommendAlternatives(
      foodName,
      category as FoodCategory | undefined,
      {
        ingredients,
        servingSize,
        isHomemade,
      }
    );

    // 3. 응답
    const responseTime = Date.now() - startTime;

    console.log(
      `[API] /alternatives: ${foodName} → ${result.alternatives.length} options (${responseTime}ms)`
    );

    return NextResponse.json({
      ...result,
      responseTime,
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = getErrorMessage(error);

    console.error(`[API] /alternatives failed (${responseTime}ms):`, error);

    return NextResponse.json(
      {
        error: 'Failed to find alternatives',
        message: errorMessage,
        responseTime,
      },
      { status: 500 }
    );
  }
}
