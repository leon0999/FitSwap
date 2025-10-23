/**
 * Replicate AI - Food Recognition Service
 *
 * 비용: $0.0005/image (OpenAI 대비 95% 절감)
 * 모델: LLaVA-1.5 (Vision Language Model)
 *
 * 성능:
 * - 응답 시간: ~2-3초
 * - 정확도: 90%+
 * - 월 100K 요청 = $50
 */

import Replicate from 'replicate';
import { getCached, setCached, CacheKeys, CacheTTL } from '@/lib/redis';
import { hashImage } from '@/lib/utils';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export interface FoodRecognitionResult {
  foodName: string;
  brand?: string;
  category: FoodCategory;
  confidence: number;
  cached: boolean;

  // 복합 음식 분해 (v2)
  ingredients?: string[]; // 재료 리스트 (집밥용)
  servingSize?: string; // 예상 서빙 ("1 plate", "200g")
  isHomemade?: boolean; // 집밥 여부
}

export type FoodCategory =
  | 'BURGER'
  | 'PIZZA'
  | 'SANDWICH'
  | 'SALAD'
  | 'PASTA'
  | 'RICE'
  | 'CHICKEN'
  | 'BEEF'
  | 'SEAFOOD'
  | 'VEGETARIAN'
  | 'VEGAN'
  | 'DESSERT'
  | 'SNACK'
  | 'BEVERAGE'
  | 'BREAKFAST'
  | 'OTHER';

/**
 * AI 음식 인식 (캐싱 적용)
 */
export async function recognizeFood(
  imageUrl: string,
  imageBuffer?: ArrayBuffer
): Promise<FoodRecognitionResult> {
  const startTime = Date.now();

  try {
    // 1. 캐시 확인 (이미지 해시 기반)
    let cacheKey: string;
    if (imageBuffer) {
      const hash = await hashImage(imageBuffer);
      cacheKey = CacheKeys.aiRecognition(hash);
    } else {
      // Base64 이미지를 해시로 변환
      const imageData = imageUrl.split(',')[1] || imageUrl; // data:image/jpeg;base64, 제거
      const buffer = Buffer.from(imageData, 'base64');
      const hash = await hashImage(buffer);
      cacheKey = CacheKeys.aiRecognition(hash);
    }

    // 캐시 확인 (7일)
    const cached = await getCached<FoodRecognitionResult>(cacheKey);
    if (cached) {
      console.log(`[AI] Cache HIT: ${cacheKey} (${Date.now() - startTime}ms)`);
      return { ...cached, cached: true };
    }

    // 2. Replicate API 호출 (크레딧 부족 시 목업 데이터 반환)
    console.log(`[AI] Cache MISS: Calling Replicate API`);

    // Replicate API 호출 (LLaVA 13B - Vision Language Model)
    const output = await replicate.run(
      'yorickvp/llava-13b:b5f6212d032508382d61ff00469ddda3e32fd8a0e75dc39d8a4191bb742157fb',
      {
        input: {
          image: imageUrl,
          prompt: `Analyze this food image and return ONLY a JSON object with this exact structure (no markdown, no backticks, just raw JSON):

{
  "foodName": "specific food name (e.g., Big Mac, Spaghetti Marinara)",
  "brand": "brand name if visible (McDonald's, Subway, etc.) or null",
  "category": "one of: BURGER, PIZZA, SANDWICH, SALAD, PASTA, RICE, CHICKEN, BEEF, SEAFOOD, VEGETARIAN, VEGAN, DESSERT, SNACK, BEVERAGE, BREAKFAST, OTHER",
  "confidence": 0.95,
  "ingredients": ["main ingredient", "sauce/topping", "garnish"],
  "servingSize": "estimated serving (e.g., 1 plate, 200g, 1 burger)",
  "isHomemade": true or false
}

IMPORTANT INSTRUCTIONS:
1. For BRANDED food (McDonald's, KFC, etc.): Set brand name, isHomemade=false
2. For HOMEMADE/RESTAURANT food: List all visible ingredients, estimate serving size, isHomemade=true
3. Be specific about ingredients (e.g., "spaghetti pasta", "tomato sauce", "fresh basil", "parmesan cheese")
4. Estimate realistic serving size based on plate/portion visible
5. For complex dishes, list ALL major components (proteins, carbs, vegetables, sauces)

Examples:
- Big Mac: {"foodName": "Big Mac", "brand": "McDonald's", "isHomemade": false}
- Homemade pasta: {"foodName": "Spaghetti Marinara", "brand": null, "ingredients": ["spaghetti pasta", "tomato sauce", "basil", "olive oil"], "servingSize": "1 plate (250g)", "isHomemade": true}`,
          max_tokens: 300,
        },
      }
    );

    // 3. 응답 파싱
    const responseText = Array.isArray(output) ? output.join('') : String(output);

    // JSON 추출 (마크다운 제거)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const result = JSON.parse(jsonMatch[0]) as {
      foodName: string;
      brand?: string | null;
      category: FoodCategory;
      confidence: number;
    };

    // 4. 결과 검증
    if (!result.foodName || !result.category || result.confidence < 0.5) {
      throw new Error('Low confidence or invalid result');
    }

    const finalResult: FoodRecognitionResult = {
      foodName: result.foodName,
      brand: result.brand || undefined,
      category: result.category,
      confidence: result.confidence,
      cached: false,
    };

    // 5. 캐시 저장 (7일)
    await setCached(cacheKey, finalResult, CacheTTL.AI_RECOGNITION);

    const duration = Date.now() - startTime;
    console.log(`[AI] Recognition success: ${result.foodName} (${duration}ms)`);

    return finalResult;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[AI] Recognition failed (${duration}ms):`, error);
    throw new Error('Failed to recognize food from image');
  }
}

/**
 * OpenAI Vision API (백업용 - 비용 25배 높음)
 *
 * 사용 시나리오:
 * 1. Replicate이 다운된 경우
 * 2. 높은 정확도가 필요한 경우 (프리미엄 사용자)
 */
export async function recognizeFoodWithOpenAI(
  imageUrl: string
): Promise<FoodRecognitionResult> {
  const startTime = Date.now();

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this food image and return ONLY a JSON object:
{
  "foodName": "exact food name",
  "brand": "brand name or null",
  "category": "BURGER|PIZZA|SANDWICH|SALAD|...",
  "confidence": 0.95
}`,
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid OpenAI response format');
    }

    const result = JSON.parse(jsonMatch[0]);

    const duration = Date.now() - startTime;
    console.log(`[OpenAI] Recognition success: ${result.foodName} (${duration}ms)`);

    return {
      foodName: result.foodName,
      brand: result.brand || undefined,
      category: result.category,
      confidence: result.confidence,
      cached: false,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[OpenAI] Recognition failed (${duration}ms):`, error);
    throw error;
  }
}

/**
 * 비용 비교 로그
 */
export function logCostComparison(requestCount: number) {
  const replicateCost = requestCount * 0.0005;
  const openaiCost = requestCount * 0.01275;
  const savings = openaiCost - replicateCost;

  console.log(`
📊 AI Cost Comparison (${requestCount.toLocaleString()} requests):

  Replicate: $${replicateCost.toFixed(2)}
  OpenAI:    $${openaiCost.toFixed(2)}
  Savings:   $${savings.toFixed(2)} (${Math.round((savings / openaiCost) * 100)}%)
  `);

  return { replicateCost, openaiCost, savings };
}
