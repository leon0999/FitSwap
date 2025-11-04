/**
 * POST /api/nutrition
 *
 * 영양 정보 조회 API (USDA FoodData)
 *
 * Request:
 * {
 *   "foodName": "Big Mac"
 * }
 *
 * Response:
 * {
 *   "results": [
 *     {
 *       "name": "McDonald's Big Mac",
 *       "calories": 540,
 *       "protein": 25,
 *       "healthScore": 42,
 *       ...
 *     }
 *   ],
 *   "cached": false,
 *   "responseTime": 456
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchFood } from '@/lib/nutrition/usda';
import { getErrorMessage } from '@/lib/utils';
import { findRealFoodNutrition } from '@/lib/nutrition/real-food-database';
import { calculateHealthScoreV2 } from '@/lib/nutrition/health-score-v2';

// Using Node runtime for file system access
export const runtime = 'nodejs';
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. 요청 파싱
    const body = await req.json();
    const { foodName } = body;

    if (!foodName) {
      return NextResponse.json(
        { error: 'foodName is required' },
        { status: 400 }
      );
    }

    // 2. 실제 음식 데이터베이스 우선 검색 (1인분/단품 기준)
    const realFood = findRealFoodNutrition(foodName);

    if (realFood) {
      // 실제 데이터베이스에서 찾음 → 정확한 1인분 영양정보 반환
      const healthScore = calculateHealthScoreV2({
        calories: realFood.calories,
        protein: realFood.protein,
        carbs: realFood.carbs,
        fat: realFood.fat,
        sugar: realFood.sugar,
        fiber: realFood.fiber,
        sodium: realFood.sodium,
        isOrganic: realFood.isOrganic,
        keywords: [realFood.name, realFood.brand || '', realFood.category],
      });

      const result = {
        name: realFood.name,
        brand: realFood.brand,
        serving: realFood.serving,
        servingWeight: realFood.servingWeight,
        calories: realFood.calories,
        protein: realFood.protein,
        carbs: realFood.carbs,
        fat: realFood.fat,
        sugar: realFood.sugar,
        fiber: realFood.fiber,
        sodium: realFood.sodium,
        healthScoreV2: healthScore,
        source: realFood.source,
        category: realFood.category,
        isOrganic: realFood.isOrganic,
        isHealthy: realFood.isHealthy,
        orderUrl: realFood.orderUrl,
        dataSource: 'real-food-database' as const,
        cached: true,
      };

      const responseTime = Date.now() - startTime;
      console.log(
        `[API] /nutrition: ${foodName} → REAL FOOD DATABASE (${realFood.calories} kcal, ${responseTime}ms)`
      );

      return NextResponse.json({
        results: [result],
        cached: true,
        responseTime,
        dataSource: 'real-food-database',
      });
    }

    // 3. USDA에서 검색 (fallback)
    console.log(
      `[API] /nutrition: ${foodName} → Fallback to USDA (not in real food database)`
    );
    const results = await searchFood(foodName);

    if (results.length === 0) {
      return NextResponse.json(
        {
          error: 'No nutrition data found',
          message: `Could not find nutrition info for "${foodName}"`,
        },
        { status: 404 }
      );
    }

    // 3. 응답
    const responseTime = Date.now() - startTime;
    const cached = results[0]?.cached || false;

    console.log(
      `[API] /nutrition: ${foodName} → ${results.length} results (${responseTime}ms, cached: ${cached})`
    );

    return NextResponse.json({
      results,
      cached,
      responseTime,
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = getErrorMessage(error);

    console.error(`[API] /nutrition failed (${responseTime}ms):`, error);

    return NextResponse.json(
      {
        error: 'Failed to fetch nutrition data',
        message: errorMessage,
        responseTime,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/nutrition?q=big%20mac
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  try {
    const results = await searchFood(query);
    const responseTime = Date.now();

    return NextResponse.json({
      results,
      responseTime,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Search failed', message: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
