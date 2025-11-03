/**
 * Delivery Deep Links Generator
 *
 * 즉시 수익화를 위한 배달 서비스 딥링크 생성
 * - Uber Eats
 * - DoorDash
 * - Grubhub
 * - Instacart
 *
 * 비용: $0 (딥링크는 무료)
 * 수익: Referral 수수료 가능 (서비스별 제휴 프로그램)
 */

/**
 * 배달 서비스 타입
 */
export type DeliveryService = 'ubereats' | 'doordash' | 'grubhub' | 'instacart';

/**
 * 배달 서비스 정보
 */
export interface DeliveryServiceInfo {
  name: string;
  icon: string; // Emoji
  color: string; // Tailwind color
  description: string;
  referralAvailable: boolean; // 제휴 프로그램 가능 여부
}

/**
 * 배달 링크 생성 옵션
 */
export interface DeliveryLinkOptions {
  foodName: string;
  latitude?: number;
  longitude?: number;
  referralCode?: string; // 제휴 코드 (나중에 추가)
}

/**
 * 배달 서비스 메타데이터
 */
export const DELIVERY_SERVICES: Record<DeliveryService, DeliveryServiceInfo> = {
  ubereats: {
    name: 'Uber Eats',
    icon: '🚗',
    color: 'green',
    description: 'Fast delivery from restaurants',
    referralAvailable: true, // Uber Eats Partner Program
  },
  doordash: {
    name: 'DoorDash',
    icon: '🏍️',
    color: 'red',
    description: 'Deliver from your favorite restaurants',
    referralAvailable: true, // DoorDash Affiliate Program
  },
  grubhub: {
    name: 'Grubhub',
    icon: '🍔',
    color: 'orange',
    description: 'Order food online',
    referralAvailable: true, // Grubhub Affiliate Program
  },
  instacart: {
    name: 'Instacart',
    icon: '🛒',
    color: 'emerald',
    description: 'Grocery delivery from local stores',
    referralAvailable: true, // Instacart Affiliate Program
  },
};

/**
 * Uber Eats 딥링크 생성
 *
 * URL 형식: https://www.ubereats.com/search?q=grilled+chicken+salad
 */
function generateUberEatsLink(options: DeliveryLinkOptions): string {
  const baseUrl = 'https://www.ubereats.com/search';
  const params = new URLSearchParams();

  // 음식명 검색
  params.set('q', options.foodName);

  // 위치 정보 (선택사항)
  if (options.latitude && options.longitude) {
    // Uber Eats는 URL에 직접 lat/lng 추가 가능
    params.set('pl', `${options.latitude},${options.longitude}`);
  }

  // Referral 코드 (나중에 추가)
  if (options.referralCode) {
    params.set('ref', options.referralCode);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * DoorDash 딥링크 생성
 *
 * URL 형식: https://www.doordash.com/search/?query=grilled+chicken+salad
 */
function generateDoorDashLink(options: DeliveryLinkOptions): string {
  const baseUrl = 'https://www.doordash.com/search';
  const params = new URLSearchParams();

  params.set('query', options.foodName);

  // 위치 정보 (선택사항)
  if (options.latitude && options.longitude) {
    params.set('lat', options.latitude.toString());
    params.set('lng', options.longitude.toString());
  }

  // Referral 코드 (나중에 추가)
  if (options.referralCode) {
    params.set('referral', options.referralCode);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Grubhub 딥링크 생성
 *
 * URL 형식: https://www.grubhub.com/search?query=grilled+chicken+salad
 */
function generateGrubhubLink(options: DeliveryLinkOptions): string {
  const baseUrl = 'https://www.grubhub.com/search';
  const params = new URLSearchParams();

  params.set('query', options.foodName);

  // 위치 정보 (선택사항)
  if (options.latitude && options.longitude) {
    params.set('location', `${options.latitude},${options.longitude}`);
  }

  // Referral 코드 (나중에 추가)
  if (options.referralCode) {
    params.set('affiliate', options.referralCode);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Instacart 딥링크 생성
 *
 * URL 형식: https://www.instacart.com/store/search?query=grilled+chicken+salad
 *
 * Note: Instacart는 주로 식료품 배달이므로 재료 검색에 유리
 */
function generateInstacartLink(options: DeliveryLinkOptions): string {
  const baseUrl = 'https://www.instacart.com/store/search';
  const params = new URLSearchParams();

  params.set('query', options.foodName);

  // Referral 코드 (나중에 추가)
  if (options.referralCode) {
    params.set('ref', options.referralCode);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * 배달 서비스 딥링크 생성 (메인 함수)
 */
export function generateDeliveryLink(
  service: DeliveryService,
  options: DeliveryLinkOptions
): string {
  switch (service) {
    case 'ubereats':
      return generateUberEatsLink(options);
    case 'doordash':
      return generateDoorDashLink(options);
    case 'grubhub':
      return generateGrubhubLink(options);
    case 'instacart':
      return generateInstacartLink(options);
    default:
      throw new Error(`Unknown delivery service: ${service}`);
  }
}

/**
 * 모든 배달 서비스 링크 생성
 *
 * 사용자가 한 번에 여러 옵션을 볼 수 있도록
 */
export function generateAllDeliveryLinks(
  options: DeliveryLinkOptions
): Record<DeliveryService, string> {
  return {
    ubereats: generateUberEatsLink(options),
    doordash: generateDoorDashLink(options),
    grubhub: generateGrubhubLink(options),
    instacart: generateInstacartLink(options),
  };
}

/**
 * 음식 카테고리별 최적 배달 서비스 추천
 *
 * 예: 식료품 → Instacart, 레스토랑 → Uber Eats/DoorDash
 */
export function getRecommendedServices(foodName: string): DeliveryService[] {
  const foodLower = foodName.toLowerCase();

  // 식료품 키워드 (Instacart 우선)
  const groceryKeywords = [
    'ingredient',
    'organic',
    'chicken breast',
    'salmon fillet',
    'vegetables',
    'fruits',
    'quinoa',
    'rice',
    'pasta',
    'eggs',
    'milk',
  ];

  const isGrocery = groceryKeywords.some((keyword) => foodLower.includes(keyword));

  if (isGrocery) {
    // 식료품: Instacart 우선, 레스토랑 서비스도 포함
    return ['instacart', 'ubereats', 'doordash', 'grubhub'];
  } else {
    // 레스토랑 음식: Uber Eats/DoorDash 우선
    return ['ubereats', 'doordash', 'grubhub', 'instacart'];
  }
}

/**
 * 음식명 정규화 (검색 최적화)
 *
 * "Grilled Chicken Salad" → "grilled chicken salad"
 * "Big Mac (McDonald's)" → "big mac"
 */
export function normalizeFoodNameForSearch(foodName: string): string {
  return foodName
    .toLowerCase()
    .replace(/\(.*?\)/g, '') // 괄호 제거
    .replace(/[^\w\s]/g, '') // 특수문자 제거
    .trim();
}

/**
 * 배달 링크 클릭 트래킹 (Analytics)
 *
 * 나중에 Google Analytics 또는 Mixpanel 연동
 */
export function trackDeliveryLinkClick(
  service: DeliveryService,
  foodName: string
): void {
  console.log(`[DeliveryLink] ${service} clicked for "${foodName}"`);

  // TODO: Analytics 이벤트 전송
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'delivery_link_click', {
      service,
      food_name: foodName,
    });
  }
}

/**
 * 제휴 수익 예상 계산
 *
 * 가정:
 * - Uber Eats: 주문당 $2-5 수수료 (1-2%)
 * - DoorDash: 주문당 $3-7 수수료 (2-3%)
 * - Grubhub: 주문당 $2-5 수수료 (1-2%)
 * - Instacart: 주문당 $5-10 수수료 (3-5%)
 *
 * 월 예상 수익:
 * - 1,000 클릭 × 10% 전환율 × $5 평균 = $500/월
 * - 10,000 클릭 × 10% 전환율 × $5 평균 = $5,000/월
 */
export function estimateAffiliateRevenue(monthlyClicks: number): {
  conservative: number; // 보수적 추정 (5% 전환)
  moderate: number; // 중간 추정 (10% 전환)
  optimistic: number; // 낙관적 추정 (15% 전환)
} {
  const avgCommission = 5; // $5 per order

  return {
    conservative: Math.round(monthlyClicks * 0.05 * avgCommission),
    moderate: Math.round(monthlyClicks * 0.1 * avgCommission),
    optimistic: Math.round(monthlyClicks * 0.15 * avgCommission),
  };
}

/**
 * Example usage:
 *
 * // 1. 단일 서비스 링크 생성
 * const uberEatsLink = generateDeliveryLink('ubereats', {
 *   foodName: 'Grilled Chicken Salad',
 *   latitude: 37.7749,
 *   longitude: -122.4194,
 * });
 * // → https://www.ubereats.com/search?q=Grilled+Chicken+Salad&pl=37.7749,-122.4194
 *
 * // 2. 모든 서비스 링크 생성
 * const allLinks = generateAllDeliveryLinks({
 *   foodName: 'Organic Quinoa Bowl',
 * });
 * // → { ubereats: '...', doordash: '...', grubhub: '...', instacart: '...' }
 *
 * // 3. 추천 서비스 확인
 * const recommended = getRecommendedServices('Chicken Breast');
 * // → ['instacart', 'ubereats', 'doordash', 'grubhub']
 *
 * // 4. 수익 예상
 * const revenue = estimateAffiliateRevenue(5000);
 * // → { conservative: $1,250, moderate: $2,500, optimistic: $3,750 }
 */
