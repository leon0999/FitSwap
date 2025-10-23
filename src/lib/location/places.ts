/**
 * Google Places API - 위치 기반 음식점 검색
 *
 * 핵심 기능:
 * 1. 사용자 위치 기반 근처 음식점 찾기
 * 2. 특정 음식 제공하는 곳 필터링
 * 3. 거리, 평점, 가격 정보 제공
 *
 * 비용: 무료 ($200 크레딧/월)
 * - Place Search: $0.032/request
 * - 월 6,250 requests 무료
 */

import { getCached, setCached, CacheKeys, CacheTTL } from '@/lib/redis';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';

export interface PlaceResult {
  // 기본 정보
  name: string;
  address: string;
  placeId: string;

  // 위치
  location: {
    lat: number;
    lng: number;
  };
  distance: string; // "0.5 miles", "800 meters"

  // 평가
  rating: number; // 0-5
  reviewCount: number;
  priceLevel?: number; // 1-4 ($-$$$$)

  // 영업 정보
  isOpen?: boolean;
  openingHours?: string[];

  // 추가 정보
  photos?: string[]; // Google Photos URLs
  types: string[]; // ["restaurant", "food"]
  phoneNumber?: string;
  website?: string;
}

export interface PlacesSearchOptions {
  location: {
    lat: number;
    lng: number;
  };
  radius?: number; // meters (기본: 2000m = 2km)
  keyword?: string; // "burger", "healthy salad"
  type?: string; // "restaurant", "cafe", "meal_delivery"
  minRating?: number; // 최소 평점 (기본: 3.5)
  priceLevel?: number[]; // [1, 2] = $ or $$
  openNow?: boolean; // 현재 영업 중만
}

/**
 * 근처 음식점 검색 (캐싱 적용)
 */
export async function searchNearbyPlaces(
  options: PlacesSearchOptions
): Promise<PlaceResult[]> {
  const startTime = Date.now();

  try {
    // 1. 캐시 키 생성
    const cacheKey = CacheKeys.places(
      `${options.location.lat},${options.location.lng}`,
      options.keyword || 'restaurant'
    );

    // 2. 캐시 확인 (30분)
    const cached = await getCached<PlaceResult[]>(cacheKey);
    if (cached) {
      console.log(`[Places] Cache HIT: ${options.keyword} (${Date.now() - startTime}ms)`);
      return cached;
    }

    // 3. Google Places API 호출
    console.log(`[Places] Searching near ${options.location.lat},${options.location.lng} for "${options.keyword}"`);

    const radius = options.radius || 2000; // 기본 2km
    const type = options.type || 'restaurant';

    const url = new URL(`${PLACES_API_URL}/nearbysearch/json`);
    url.searchParams.set('location', `${options.location.lat},${options.location.lng}`);
    url.searchParams.set('radius', radius.toString());
    url.searchParams.set('type', type);
    if (options.keyword) {
      url.searchParams.set('keyword', options.keyword);
    }
    if (options.openNow) {
      url.searchParams.set('opennow', 'true');
    }
    url.searchParams.set('key', GOOGLE_PLACES_API_KEY!);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API status: ${data.status}`);
    }

    if (!data.results || data.results.length === 0) {
      console.log(`[Places] No results for: ${options.keyword}`);
      return [];
    }

    // 4. 결과 파싱 및 필터링
    const places = data.results
      .filter((place: any) => {
        // 최소 평점 필터
        if (options.minRating && place.rating < options.minRating) {
          return false;
        }

        // 가격대 필터
        if (options.priceLevel && place.price_level) {
          if (!options.priceLevel.includes(place.price_level)) {
            return false;
          }
        }

        return true;
      })
      .map((place: any) => parsePlace(place, options.location))
      .slice(0, 10); // 상위 10개

    // 5. 거리순 정렬
    places.sort((a, b) => {
      const distA = parseDistance(a.distance);
      const distB = parseDistance(b.distance);
      return distA - distB;
    });

    // 6. 캐시 저장 (30분)
    await setCached(cacheKey, places, 30 * 60);

    const duration = Date.now() - startTime;
    console.log(`[Places] Found ${places.length} places for "${options.keyword}" (${duration}ms)`);

    return places;

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Places] Search failed (${duration}ms):`, error);
    throw error;
  }
}

/**
 * Google Place 데이터 파싱
 */
function parsePlace(place: any, userLocation: { lat: number; lng: number }): PlaceResult {
  const placeLocation = {
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
  };

  // 거리 계산
  const distance = calculateDistance(userLocation, placeLocation);

  return {
    name: place.name,
    address: place.vicinity || place.formatted_address,
    placeId: place.place_id,
    location: placeLocation,
    distance: formatDistance(distance),
    rating: place.rating || 0,
    reviewCount: place.user_ratings_total || 0,
    priceLevel: place.price_level,
    isOpen: place.opening_hours?.open_now,
    types: place.types || [],
    photos: place.photos?.slice(0, 3).map((photo: any) => {
      return `${PLACES_API_URL}/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`;
    }),
  };
}

/**
 * 두 지점 간 거리 계산 (Haversine formula)
 * @returns 거리 (meters)
 */
function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // meters
}

/**
 * 거리 포맷팅
 * 1609 meters → "1.0 miles"
 * 800 meters → "0.5 miles"
 */
function formatDistance(meters: number): string {
  // 미국 시장 타겟 → miles 사용
  const miles = meters / 1609.34;

  if (miles < 0.1) {
    return `${Math.round(meters)} meters`;
  } else if (miles < 10) {
    return `${miles.toFixed(1)} miles`;
  } else {
    return `${Math.round(miles)} miles`;
  }
}

/**
 * 거리 문자열 → 숫자 (정렬용)
 */
function parseDistance(distanceStr: string): number {
  const match = distanceStr.match(/([\d.]+)\s*(miles|meters)/);
  if (!match) return 999999;

  const value = parseFloat(match[1]);
  const unit = match[2];

  if (unit === 'miles') {
    return value * 1609.34; // miles to meters
  } else {
    return value;
  }
}

/**
 * 음식별 추천 검색 키워드
 */
export function getSearchKeywordForFood(foodName: string, category?: string): string {
  const nameLower = foodName.toLowerCase();

  // 브랜드 음식
  if (nameLower.includes('big mac') || nameLower.includes("mcdonald's")) {
    return "McDonald's";
  }
  if (nameLower.includes('whopper') || nameLower.includes('burger king')) {
    return 'Burger King';
  }
  if (nameLower.includes('subway')) {
    return 'Subway';
  }

  // 카테고리별 일반 키워드
  const categoryMap: Record<string, string> = {
    BURGER: 'burger restaurant',
    PIZZA: 'pizza restaurant',
    SANDWICH: 'sandwich shop',
    SALAD: 'salad bar healthy restaurant',
    PASTA: 'italian restaurant pasta',
    RICE: 'asian restaurant',
    CHICKEN: 'chicken restaurant',
    BEEF: 'steakhouse',
    SEAFOOD: 'seafood restaurant',
    VEGETARIAN: 'vegetarian restaurant',
    VEGAN: 'vegan restaurant',
    DESSERT: 'dessert cafe bakery',
    SNACK: 'cafe snack',
    BEVERAGE: 'cafe coffee',
    BREAKFAST: 'breakfast restaurant',
  };

  if (category && categoryMap[category]) {
    return categoryMap[category];
  }

  // 기본: 음식명 그대로
  return foodName;
}

/**
 * 대체 음식 판매하는 곳 검색
 */
export async function findPlacesForAlternatives(
  alternatives: Array<{ name: string; category?: string }>,
  userLocation: { lat: number; lng: number }
): Promise<Map<string, PlaceResult[]>> {
  const results = new Map<string, PlaceResult[]>();

  // 대체품별로 병렬 검색
  const promises = alternatives.slice(0, 3).map(async (alt) => {
    const keyword = getSearchKeywordForFood(alt.name, alt.category);

    try {
      const places = await searchNearbyPlaces({
        location: userLocation,
        radius: 3000, // 3km
        keyword,
        minRating: 3.5,
        openNow: false,
      });

      results.set(alt.name, places.slice(0, 3)); // 상위 3개
    } catch (error) {
      console.error(`[Places] Failed to find places for "${alt.name}":`, error);
      results.set(alt.name, []);
    }
  });

  await Promise.all(promises);

  return results;
}

/**
 * 캐시 키 헬퍼 추가
 */
declare module '@/lib/redis' {
  interface CacheKeysType {
    places: (location: string, keyword: string) => string;
  }
}
