/**
 * Google Places API - Restaurant Search
 *
 * 무료 플랜:
 * - 월 $200 크레딧
 * - Places API: ~11,000 requests/month
 * - Demo 모드: API 키 없으면 Mock 데이터 반환
 */

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating: number;
  userRatingsTotal: number;
  priceLevel?: number; // 1-4 ($-$$$$)
  openNow?: boolean;
  location: {
    lat: number;
    lng: number;
  };
  distance?: number; // meters
  photoUrl?: string;
  googleMapsUrl: string;
}

export interface SearchRestaurantsParams {
  foodName: string;
  latitude: number;
  longitude: number;
  radius?: number; // meters (기본 5000 = 5km)
}

/**
 * 근처 레스토랑 검색
 *
 * @param params - 검색 파라미터
 * @returns 레스토랑 목록 (최대 5개)
 */
export async function searchNearbyRestaurants(
  params: SearchRestaurantsParams
): Promise<Restaurant[]> {
  const startTime = Date.now();
  const { foodName, latitude, longitude, radius = 5000 } = params;

  try {
    // Demo 모드 체크
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.log(`[GooglePlaces] Demo mode: returning mock restaurants`);
      return getDemoRestaurants(foodName);
    }

    // Google Places API 호출 (Nearby Search)
    const query = prepareFoodQuery(foodName);
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    url.searchParams.set('location', `${latitude},${longitude}`);
    url.searchParams.set('radius', radius.toString());
    url.searchParams.set('keyword', query);
    url.searchParams.set('type', 'restaurant');
    url.searchParams.set('key', process.env.GOOGLE_MAPS_API_KEY!);

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // 1시간 캐싱
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API status: ${data.status}`);
    }

    // 결과 없으면 Mock 반환
    if (!data.results || data.results.length === 0) {
      console.log(`[GooglePlaces] No results for "${foodName}", using mock data`);
      return getDemoRestaurants(foodName);
    }

    // 상위 5개 레스토랑 변환
    const restaurants: Restaurant[] = data.results
      .slice(0, 5)
      .map((place: any) => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        rating: place.rating || 0,
        userRatingsTotal: place.user_ratings_total || 0,
        priceLevel: place.price_level,
        openNow: place.opening_hours?.open_now,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        distance: calculateDistance(
          latitude,
          longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        ),
        photoUrl: place.photos?.[0]
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
          : undefined,
        googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0)); // 거리 가까운 순

    const duration = Date.now() - startTime;
    console.log(
      `[GooglePlaces] Found ${restaurants.length} restaurants for "${foodName}" (${duration}ms)`
    );

    return restaurants;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[GooglePlaces] Search failed (${duration}ms):`, error);
    return getDemoRestaurants(foodName);
  }
}

/**
 * 음식 이름을 검색어로 변환
 *
 * "Grilled Chicken Salad" → "grilled chicken salad"
 */
function prepareFoodQuery(foodName: string): string {
  // 브랜드명 제거
  const withoutBrand = foodName.split(',')[0].trim();
  return withoutBrand.toLowerCase();
}

/**
 * 두 좌표 간 거리 계산 (Haversine formula)
 *
 * @returns 거리 (meters)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // 지구 반지름 (meters)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // 반올림
}

/**
 * 거리 포맷팅 (meters → km or m)
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}

/**
 * Demo 모드 Mock 데이터
 */
function getDemoRestaurants(foodName: string): Restaurant[] {
  const mockRestaurants: Restaurant[] = [
    {
      id: 'demo-1',
      name: 'Healthy Kitchen',
      address: '123 Green Street, San Francisco',
      rating: 4.5,
      userRatingsTotal: 250,
      priceLevel: 2,
      openNow: true,
      location: { lat: 37.7749, lng: -122.4194 },
      distance: 500,
      googleMapsUrl: 'https://www.google.com/maps',
    },
    {
      id: 'demo-2',
      name: 'Fresh Salad Bar',
      address: '456 Health Ave, San Francisco',
      rating: 4.2,
      userRatingsTotal: 180,
      priceLevel: 2,
      openNow: true,
      location: { lat: 37.7849, lng: -122.4094 },
      distance: 1200,
      googleMapsUrl: 'https://www.google.com/maps',
    },
    {
      id: 'demo-3',
      name: 'Organic Cafe',
      address: '789 Wellness Blvd, San Francisco',
      rating: 4.7,
      userRatingsTotal: 320,
      priceLevel: 3,
      openNow: false,
      location: { lat: 37.7649, lng: -122.4294 },
      distance: 2100,
      googleMapsUrl: 'https://www.google.com/maps',
    },
  ];

  return mockRestaurants;
}

/**
 * 사용자 현재 위치 가져오기 (브라우저)
 */
export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('[Geolocation] Failed:', error);
        // 기본 위치 (San Francisco)
        resolve({ latitude: 37.7749, longitude: -122.4194 });
      }
    );
  });
}
