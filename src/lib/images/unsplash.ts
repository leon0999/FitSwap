/**
 * Unsplash API - Food Photo Search
 *
 * 무료 플랜:
 * - 50 requests/hour
 * - 5,000 requests/month
 * - Demo 모드: 요청 없이 placeholder 반환
 */

export interface FoodPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  photographerName: string;
  photographerLink: string;
  downloadLink: string;
}

/**
 * 음식 사진 검색
 *
 * @param foodName - 음식 이름 (예: "grilled chicken salad")
 * @param count - 가져올 사진 개수 (기본 1개)
 */
export async function searchFoodPhoto(
  foodName: string,
  count: number = 1
): Promise<FoodPhoto | null> {
  const startTime = Date.now();

  try {
    // Demo 모드 체크 (API 키 없으면 placeholder 반환)
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      console.log(`[Unsplash] Demo mode: returning placeholder for "${foodName}"`);
      return getDemoPhoto(foodName);
    }

    // Unsplash API 호출
    const query = prepareFoodQuery(foodName);
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
        next: { revalidate: 86400 }, // 24시간 캐싱
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    const data = await response.json();

    // 결과 없으면 placeholder
    if (!data.results || data.results.length === 0) {
      console.log(`[Unsplash] No results for "${foodName}", using placeholder`);
      return getDemoPhoto(foodName);
    }

    // 첫 번째 사진 선택
    const photo = data.results[0];
    const result: FoodPhoto = {
      id: photo.id,
      url: photo.urls.regular,
      thumbnailUrl: photo.urls.small,
      photographerName: photo.user.name,
      photographerLink: photo.user.links.html,
      downloadLink: photo.links.download_location,
    };

    const duration = Date.now() - startTime;
    console.log(`[Unsplash] Photo found for "${foodName}" (${duration}ms)`);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Unsplash] Search failed (${duration}ms):`, error);
    return getDemoPhoto(foodName);
  }
}

/**
 * 음식 이름을 Unsplash 검색어로 변환
 *
 * "Grilled Chicken Salad, McDonald's" → "grilled chicken salad food"
 */
function prepareFoodQuery(foodName: string): string {
  // 브랜드명 제거
  const withoutBrand = foodName.split(',')[0].trim();

  // "food" 키워드 추가 (더 정확한 결과)
  return `${withoutBrand} food`;
}

/**
 * Demo 모드 placeholder (API 키 없을 때)
 */
function getDemoPhoto(foodName: string): FoodPhoto {
  // 음식 카테고리별 고정 이미지
  const categoryImages: Record<string, string> = {
    burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    chicken: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800',
    pasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
    sandwich: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800',
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  };

  // 카테고리 매칭
  const nameLower = foodName.toLowerCase();
  let imageUrl = categoryImages.default;

  for (const [category, url] of Object.entries(categoryImages)) {
    if (nameLower.includes(category)) {
      imageUrl = url;
      break;
    }
  }

  return {
    id: 'demo',
    url: imageUrl,
    thumbnailUrl: imageUrl,
    photographerName: 'Unsplash',
    photographerLink: 'https://unsplash.com',
    downloadLink: imageUrl,
  };
}

/**
 * 여러 음식 사진 동시 검색
 */
export async function searchMultipleFoodPhotos(
  foodNames: string[]
): Promise<Map<string, FoodPhoto | null>> {
  const results = new Map<string, FoodPhoto | null>();

  // 병렬 처리 (최대 5개씩)
  const chunks = chunkArray(foodNames, 5);

  for (const chunk of chunks) {
    const promises = chunk.map(async (name) => {
      const photo = await searchFoodPhoto(name);
      return { name, photo };
    });

    const chunkResults = await Promise.all(promises);
    chunkResults.forEach(({ name, photo }) => {
      results.set(name, photo);
    });

    // Rate limit 방지 (1초 대기)
    if (chunks.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * 배열을 청크로 나누기
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
