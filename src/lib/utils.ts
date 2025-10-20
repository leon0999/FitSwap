/**
 * 유틸리티 함수 모음
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS 클래스 병합
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 건강 점수 계산 알고리즘
 * 0-100 점수 반환
 */
export function calculateHealthScore(nutrition: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}): number {
  let score = 100;

  // 칼로리 패널티 (100g 기준)
  if (nutrition.calories > 400) score -= 25;
  else if (nutrition.calories > 250) score -= 15;
  else if (nutrition.calories > 150) score -= 5;

  // 지방 패널티
  if (nutrition.fat > 20) score -= 20;
  else if (nutrition.fat > 10) score -= 10;

  // 설탕 패널티
  if (nutrition.sugar && nutrition.sugar > 15) score -= 20;
  else if (nutrition.sugar && nutrition.sugar > 8) score -= 10;

  // 나트륨 패널티 (mg)
  if (nutrition.sodium && nutrition.sodium > 800) score -= 15;
  else if (nutrition.sodium && nutrition.sodium > 400) score -= 7;

  // 단백질 보너스
  if (nutrition.protein >= 20) score += 10;
  else if (nutrition.protein >= 10) score += 5;

  // 섬유질 보너스
  if (nutrition.fiber && nutrition.fiber >= 5) score += 10;
  else if (nutrition.fiber && nutrition.fiber >= 3) score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * 칼로리 절감 퍼센트 계산
 */
export function calculateCaloriesSavedPercent(
  original: number,
  alternative: number
): number {
  if (original === 0) return 0;
  return Math.round(((original - alternative) / original) * 100);
}

/**
 * 이미지 해시 생성 (캐싱용)
 */
export async function hashImage(imageBuffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', imageBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * 숫자 포맷팅
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * 날짜 포맷팅
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

/**
 * 지연 함수 (디바운싱용)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 배열 청크 분할
 */
export function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

/**
 * 안전한 JSON 파싱
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * 에러 메시지 추출
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}
