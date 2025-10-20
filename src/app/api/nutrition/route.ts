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

export const runtime = 'edge';
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

    // 2. USDA에서 검색
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
