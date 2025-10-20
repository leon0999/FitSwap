/**
 * Redis Client - Upstash
 * 프로급 캐싱 시스템
 */

import { Redis } from '@upstash/redis';

// Singleton Redis Client
export const redis = Redis.fromEnv();

/**
 * 캐시 키 생성 헬퍼
 */
export const CacheKeys = {
  foodByName: (name: string) => `food:name:${name.toLowerCase()}`,
  foodById: (id: string) => `food:id:${id}`,
  foodSwaps: (foodId: string) => `swaps:${foodId}`,
  userSearches: (userId: string) => `user:${userId}:searches`,
  usdaFood: (query: string) => `usda:${query.toLowerCase()}`,
  aiRecognition: (imageHash: string) => `ai:recognition:${imageHash}`,
} as const;

/**
 * 캐시 TTL (초 단위)
 */
export const CacheTTL = {
  FOOD_DATA: 86400, // 24시간
  FOOD_SWAPS: 43200, // 12시간
  USER_SEARCHES: 3600, // 1시간
  AI_RECOGNITION: 604800, // 7일
  USDA_DATA: 2592000, // 30일
} as const;

/**
 * 캐시 헬퍼 함수
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get<T>(key);
    return cached;
  } catch (error) {
    console.error('Redis GET error:', error);
    return null;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttl: number = CacheTTL.FOOD_DATA
): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttl });
  } catch (error) {
    console.error('Redis SET error:', error);
  }
}

export async function deleteCached(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis DEL error:', error);
  }
}

/**
 * 캐시 통계
 */
export async function getCacheStats() {
  try {
    const info = await redis.info();
    return info;
  } catch (error) {
    console.error('Redis INFO error:', error);
    return null;
  }
}
