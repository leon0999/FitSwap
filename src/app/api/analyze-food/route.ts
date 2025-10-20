/**
 * POST /api/analyze-food
 *
 * AI 음식 인식 API
 *
 * Request:
 * {
 *   "imageUrl": "https://..." or "data:image/jpeg;base64,..."
 * }
 *
 * Response:
 * {
 *   "foodName": "Big Mac",
 *   "brand": "McDonald's",
 *   "category": "BURGER",
 *   "confidence": 0.95,
 *   "cached": false,
 *   "responseTime": 2341
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { recognizeFood } from '@/lib/ai/replicate';
import { getErrorMessage } from '@/lib/utils';

export const runtime = 'edge'; // Edge Runtime (빠른 응답)
export const maxDuration = 30; // 30초 타임아웃

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. 요청 파싱
    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl is required' },
        { status: 400 }
      );
    }

    // 2. AI 음식 인식
    const result = await recognizeFood(imageUrl);

    // 3. 성능 로깅
    const responseTime = Date.now() - startTime;
    console.log(`[API] /analyze-food: ${result.foodName} (${responseTime}ms, cached: ${result.cached})`);

    // 4. 응답
    return NextResponse.json({
      ...result,
      responseTime,
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = getErrorMessage(error);

    console.error(`[API] /analyze-food failed (${responseTime}ms):`, error);

    return NextResponse.json(
      {
        error: 'Failed to analyze food',
        message: errorMessage,
        responseTime,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze-food (헬스 체크)
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'analyze-food',
    timestamp: new Date().toISOString(),
  });
}
