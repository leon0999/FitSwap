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

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. 요청 파싱
    const body = await req.json();
    const { foodName, category } = body;

    if (!foodName) {
      return NextResponse.json(
        { error: 'foodName is required' },
        { status: 400 }
      );
    }

    // 2. 대체품 추천
    const result = await recommendAlternatives(
      foodName,
      category as FoodCategory | undefined
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
