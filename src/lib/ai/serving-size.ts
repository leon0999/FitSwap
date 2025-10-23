/**
 * OpenAI Vision API - 서빙 사이즈 시각적 추정
 *
 * 목적: 사진에서 음식의 양을 정확하게 추정
 * 방법: 접시/그릇/손 크기 비교
 *
 * 비용: Replicate 대비 25배 높음
 * 사용: 프리미엄 기능 또는 정확도 중요 시
 *
 * TODO: 프리미엄 구독 시 활성화
 */

export interface ServingSizeEstimate {
  estimatedGrams: number;
  estimatedServings: number; // 1 serving = 표준 1인분
  confidence: number; // 0-100
  visualCues: string[]; // ["plate size: medium", "portion: half plate"]
  method: 'visual_analysis' | 'standard_default';
}

/**
 * OpenAI Vision으로 서빙 사이즈 추정 (프리미엄)
 *
 * @param imageUrl - Base64 이미지
 * @param foodType - 음식 종류 (pasta, burger, etc.)
 */
export async function estimateServingSize(
  imageUrl: string,
  foodType: string
): Promise<ServingSizeEstimate> {
  const startTime = Date.now();

  try {
    // OpenAI Vision API 호출
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
                text: `Analyze this ${foodType} image and estimate the serving size. Return JSON:
{
  "estimatedGrams": 250,
  "estimatedServings": 1.5,
  "confidence": 85,
  "visualCues": ["plate size: large", "portion: 3/4 plate filled", "estimated depth: 3cm"],
  "method": "visual_analysis"
}

Guidelines:
- Use plate/bowl size as reference (standard dinner plate = 26cm diameter)
- Estimate depth of food
- Compare to hand size if visible
- Standard servings: burger=1, pasta plate=200-300g, salad bowl=150g
- Be conservative in estimates`,
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
      throw new Error(`OpenAI Vision API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // JSON 추출
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid OpenAI Vision response');
    }

    const result = JSON.parse(jsonMatch[0]) as ServingSizeEstimate;

    const duration = Date.now() - startTime;
    console.log(`[ServingSize] Estimated ${result.estimatedGrams}g (${duration}ms, confidence: ${result.confidence}%)`);

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[ServingSize] Estimation failed (${duration}ms):`, error);

    // Fallback: 기본 서빙 사이즈 반환
    return getDefaultServingSize(foodType);
  }
}

/**
 * 기본 서빙 사이즈 (OpenAI 실패 시 Fallback)
 */
function getDefaultServingSize(foodType: string): ServingSizeEstimate {
  const defaults: Record<string, number> = {
    burger: 200,
    pizza: 100, // per slice
    pasta: 250,
    salad: 150,
    rice: 150,
    chicken: 150,
    steak: 200,
    sandwich: 150,
    default: 200,
  };

  const typeLower = foodType.toLowerCase();
  let grams = defaults.default;

  for (const [key, value] of Object.entries(defaults)) {
    if (typeLower.includes(key)) {
      grams = value;
      break;
    }
  }

  return {
    estimatedGrams: grams,
    estimatedServings: 1.0,
    confidence: 60, // 낮은 신뢰도 (시각 분석 없음)
    visualCues: ['standard portion size assumed'],
    method: 'standard_default',
  };
}

/**
 * 비용 계산
 */
export function calculateServingSizeCost(requestCount: number): number {
  // OpenAI Vision: $0.01/image
  const cost = requestCount * 0.01;
  return cost;
}

/**
 * 프리미엄 기능 여부 확인
 */
export function isServingSizeEstimationAvailable(
  userPlan: 'free' | 'premium'
): boolean {
  // 무료 플랜: 기본 서빙 사이즈만
  // 프리미엄 플랜: OpenAI Vision 사용
  return userPlan === 'premium';
}
