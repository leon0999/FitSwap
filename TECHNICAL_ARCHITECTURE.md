# 🏗️ HealthyNow: 프로 엔지니어의 기술 아키텍처 재설계

## 🎯 설계 원칙

```typescript
const engineeringPrinciples = {
  speed: "< 100ms 응답 시간 (사용자 이탈 방지)",
  simplicity: "3-click 이내 주문 완료",
  scalability: "10만 → 100만 사용자 대응",
  reliability: "99.9% uptime",
  cost_efficiency: "$100/month → $3,000/month (1000배 성장 시)"
};
```

---

## 📐 시스템 아키텍처 (High-Level)

```
┌─────────────┐
│   사용자    │
│   (Web/App) │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────┐
│   Frontend (Next.js 15 + React)  │
│   - 검색 UI (Algolia InstantSearch)│
│   - 결과 표시                      │
│   - 칼로리 뱅크 대시보드           │
└──────┬───────────────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│   Edge Functions (Vercel Edge)   │
│   - A/B 테스트                    │
│   - 개인화 추천                   │
│   - 위치 기반 필터링              │
└──────┬───────────────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│   Backend API (Next.js API Routes)│
│   - Search: /api/search          │
│   - Order Tracking: /api/orders  │
│   - User Profile: /api/user      │
└──────┬───────────────────────────┘
       │
       ├────→ Algolia (검색 엔진)
       │      - 인덱스: 100K+ 음식
       │      - < 10ms 검색
       │
       ├────→ Supabase (데이터베이스)
       │      - User profiles
       │      - Order history
       │      - Calorie bank
       │
       ├────→ Redis (캐싱)
       │      - 검색 결과 캐싱
       │      - 레스토랑 정보 캐싱
       │
       └────→ OpenAI GPT-4 (선택적)
              - 자연어 검색 해석
              - 맞춤형 추천 생성
```

---

## 🔍 핵심 기능: 스마트 검색 시스템

### 1. 검색 인덱스 구조 (Algolia)

```typescript
// src/lib/search/index-structure.ts

interface FoodSearchRecord {
  objectID: string;                    // "mcdonalds-big-mac"

  // 기본 정보
  name: string;                        // "Big Mac"
  brand: string;                       // "McDonald's"
  category: string;                    // "burger"
  tags: string[];                      // ["beef", "cheese", "fast-food"]

  // 영양정보
  calories: number;                    // 563
  protein: number;                     // 25
  carbs: number;                       // 46
  fat: number;                         // 30
  fiber: number;                       // 3
  sugar: number;                       // 9
  sodium: number;                      // 1010

  // 건강 점수
  healthScore: number;                 // 24 (0-100)
  isHealthy: boolean;                  // false
  isOrganic: boolean;                  // false

  // 주문 정보
  orderUrls: {
    doordash?: string;
    ubereats?: string;
    grubhub?: string;
  };

  avgPrice: number;                    // 8.99
  avgDeliveryTime: number;             // 25 (minutes)

  // 평가
  rating: number;                      // 4.5
  reviewCount: number;                 // 1234

  // 메타데이터
  locations: string[];                 // ["NYC", "LA", "SF"]
  availability: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    latenight: boolean;
  };

  // 검색 최적화
  _searchableText: string;             // "big mac burger mcdonalds beef cheese"
  _popularityScore: number;            // 0-100 (주문 빈도 기반)
}
```

### 2. 검색 랭킹 알고리즘

```typescript
// src/lib/search/ranking.ts

class SearchRanking {
  // Algolia Custom Ranking 설정

  static getRankingFormula() {
    return [
      // 1순위: 텍스트 매칭 (Algolia 기본)
      "typo",
      "geo",
      "words",
      "filters",
      "proximity",
      "attribute",
      "exact",

      // 2순위: 커스텀 랭킹
      "desc(healthScore)",           // 건강 점수 높은 순
      "desc(_popularityScore)",      // 인기 음식 우선
      "asc(calories)",               // 칼로리 낮은 순
      "desc(rating)",                // 평점 높은 순
      "asc(avgDeliveryTime)"         // 빠른 배달 우선
    ];
  }

  // 개인화 부스팅
  static getPersonalizedBoost(userId: string, record: FoodSearchRecord) {
    const userPrefs = getUserPreferences(userId);

    let boost = 1.0;

    // 과거 주문 기록 반영
    if (userPrefs.pastOrders.includes(record.brand)) {
      boost *= 1.3;  // 30% 부스트
    }

    // 식단 선호도
    if (userPrefs.diet === "vegetarian" && record.tags.includes("vegetarian")) {
      boost *= 1.5;  // 50% 부스트
    }

    // 칼로리 목표
    if (userPrefs.dailyCalorieGoal) {
      const remaining = userPrefs.dailyCalorieGoal - userPrefs.todayCalories;
      if (record.calories <= remaining) {
        boost *= 1.2;  // 20% 부스트
      }
    }

    return boost;
  }
}
```

### 3. 실시간 검색 UI

```typescript
// src/components/SmartSearch.tsx

import { InstantSearch, SearchBox, Hits, RefinementList } from 'react-instantsearch-dom';

export default function SmartSearch() {
  return (
    <InstantSearch
      searchClient={algoliasearch('APP_ID', 'API_KEY')}
      indexName="foods"
    >
      {/* 검색창 */}
      <SearchBox
        placeholder="What are you craving? (pizza, burger, salad...)"
        autoFocus
        translations={{
          placeholder: 'Try "healthy pizza" or "low carb burger"'
        }}
      />

      {/* 인기 검색어 */}
      <QuickFilters>
        <FilterButton>🍕 Pizza</FilterButton>
        <FilterButton>🍔 Burgers</FilterButton>
        <FilterButton>🥗 Salads</FilterButton>
        <FilterButton>🌮 Tacos</FilterButton>
      </QuickFilters>

      {/* 필터 */}
      <Filters>
        <RefinementList attribute="category" />
        <RefinementList attribute="isHealthy" label="Healthy Only" />
        <RangeSlider attribute="calories" label="Calories" max={800} />
        <RangeSlider attribute="avgPrice" label="Price" max={30} />
      </Filters>

      {/* 결과 */}
      <Hits hitComponent={FoodCard} />

      {/* 실시간 통계 */}
      <SearchStats />
    </InstantSearch>
  );
}
```

---

## 🎮 칼로리 뱅크 시스템

### 1. 데이터베이스 스키마

```typescript
// src/lib/database/schema.ts

interface User {
  id: string;
  email: string;
  name: string;

  // 목표 설정
  dailyCalorieGoal: number;      // 2000
  weeklyGoal: string;             // "maintain" | "lose" | "gain"

  // 식단 선호도
  diet: "omnivore" | "vegetarian" | "vegan" | "keto" | "paleo";
  allergies: string[];            // ["peanuts", "shellfish"]

  // 게이미피케이션
  points: number;                 // 1250
  level: number;                  // 5
  streak: number;                 // 12 (days)
  badges: Badge[];

  createdAt: Date;
  updatedAt: Date;
}

interface Order {
  id: string;
  userId: string;

  // 주문 정보
  foodId: string;
  foodName: string;
  restaurant: string;

  // 영양정보
  calories: number;
  protein: number;
  // ... 기타 영양소

  // 메타
  orderedAt: Date;
  platform: "doordash" | "ubereats" | "grubhub";
  price: number;

  // 칼로리 뱅크
  dailyBudgetBefore: number;
  dailyBudgetAfter: number;
}

interface CalorieBank {
  id: string;
  userId: string;
  date: Date;                     // 2024-01-15

  // 일일 집계
  goal: number;                   // 2000
  consumed: number;               // 1400
  remaining: number;              // 600

  // 분석
  meals: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snacks: number;
  };

  // 성과
  withinBudget: boolean;
  caloriesSaved: number;          // vs 이전 평균
  healthScore: number;            // 0-100
}
```

### 2. 칼로리 뱅크 로직

```typescript
// src/lib/calorie-bank/tracker.ts

class CalorieTracker {
  async recordOrder(userId: string, order: Order) {
    // 1. 오늘의 뱅크 가져오기
    const today = await this.getTodaysBank(userId);

    // 2. 업데이트
    const updated = {
      ...today,
      consumed: today.consumed + order.calories,
      remaining: today.goal - (today.consumed + order.calories)
    };

    // 3. 피드백 생성
    const feedback = this.generateFeedback(updated, order);

    // 4. 포인트 및 배지 계산
    const rewards = await this.calculateRewards(userId, updated);

    // 5. 저장
    await db.calorieBank.upsert(updated);

    return {
      bank: updated,
      feedback,
      rewards
    };
  }

  generateFeedback(bank: CalorieBank, order: Order) {
    const remaining = bank.remaining;

    if (remaining < 0) {
      return {
        type: "warning",
        message: `You're ${Math.abs(remaining)} calories over budget`,
        suggestion: "Consider a light dinner or skip snacks",
        emoji: "⚠️"
      };
    }

    if (remaining > 800) {
      return {
        type: "success",
        message: `Great choice! ${remaining} calories left today`,
        suggestion: "Room for a healthy dessert 🍓",
        emoji: "💚"
      };
    }

    return {
      type: "info",
      message: `${remaining} calories remaining`,
      suggestion: "Perfect for a normal dinner",
      emoji: "👍"
    };
  }

  async calculateRewards(userId: string, bank: CalorieBank) {
    const rewards = [];

    // 예산 내 유지
    if (bank.withinBudget) {
      rewards.push({
        type: "points",
        amount: 10,
        reason: "Stayed within budget"
      });
    }

    // 건강 점수
    if (bank.healthScore >= 80) {
      rewards.push({
        type: "points",
        amount: 20,
        reason: "Excellent food choices"
      });
    }

    // 연속 달성
    const streak = await this.getStreak(userId);
    if (streak >= 7) {
      rewards.push({
        type: "badge",
        badge: "7-Day Streak",
        icon: "🔥"
      });
    }

    return rewards;
  }
}
```

---

## 🚀 성능 최적화

### 1. 캐싱 전략

```typescript
// src/lib/cache/strategy.ts

class CacheStrategy {
  // 3-Tier Caching

  // Tier 1: 브라우저 캐시 (즉시)
  static browserCache = {
    searchResults: "5분",
    userProfile: "10분",
    restaurantInfo: "30분"
  };

  // Tier 2: CDN (Vercel Edge)
  static cdnCache = {
    staticAssets: "1년",
    apiResponses: "1분",
    images: "1주일"
  };

  // Tier 3: Redis (서버 사이드)
  static redisCache = {
    algoliaResults: "10분",
    nutritionData: "1일",
    restaurantMenu: "1시간"
  };
}

// 실제 구현
async function searchWithCache(query: string) {
  const cacheKey = `search:${query}`;

  // 1. Redis 확인
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Algolia 검색
  const results = await algolia.search(query);

  // 3. 캐시 저장
  await redis.setex(cacheKey, 600, JSON.stringify(results));

  return results;
}
```

### 2. 데이터베이스 최적화

```typescript
// Supabase 인덱스

CREATE INDEX idx_orders_user_date ON orders(user_id, ordered_at DESC);
CREATE INDEX idx_calorie_bank_user_date ON calorie_bank(user_id, date DESC);
CREATE INDEX idx_users_email ON users(email);

// 쿼리 최적화 예시
SELECT
  u.id,
  u.name,
  u.dailyCalorieGoal,
  cb.consumed,
  cb.remaining,
  (
    SELECT COUNT(*)
    FROM orders
    WHERE user_id = u.id
      AND ordered_at > NOW() - INTERVAL '7 days'
  ) as weekly_orders
FROM users u
LEFT JOIN calorie_bank cb ON cb.user_id = u.id AND cb.date = CURRENT_DATE
WHERE u.id = $1;
```

### 3. 번들 최적화

```typescript
// next.config.js

module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'date-fns']
  },

  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        common: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    };
    return config;
  }
};

// 결과:
// - Initial Load: 85 KB (gzipped)
// - Time to Interactive: < 2s (on 3G)
```

---

## 📱 모바일 앱 전략 (Phase 2)

```typescript
// React Native 대신 Progressive Web App (PWA)

const pwaStrategy = {
  why: "빠른 개발, 단일 코드베이스, 앱스토어 수수료 없음",

  features: {
    installable: true,          // 홈 화면에 추가 가능
    offline: true,              // 오프라인 캐싱
    push_notifications: true,   // 주문 알림
    camera_access: false        // 사진 찍기 제거 (불필요)
  },

  timeline: "3개월 후 (웹 PMF 확인 후)",

  native_consideration: {
    when: "100K+ users, $500K+ ARR",
    reason: "Better UX, retention 개선 (10-20%)",
    platform: "React Native (iOS + Android 동시)"
  }
};
```

---

## 🔐 보안 & 프라이버시

```typescript
const securityMeasures = {
  authentication: {
    provider: "Supabase Auth",
    methods: ["email", "google", "apple"],
    mfa: "optional"
  },

  data_protection: {
    encryption: "AES-256 at rest",
    transmission: "TLS 1.3",
    pii: "Minimal collection (email, name only)"
  },

  compliance: {
    gdpr: "Yes (EU users)",
    ccpa: "Yes (CA users)",
    hipaa: "No (not healthcare provider)"
  }
};
```

---

## 📊 모니터링 & 로깅

```typescript
// src/lib/monitoring/setup.ts

import * as Sentry from '@sentry/nextjs';
import posthog from 'posthog-js';

// 에러 추적
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,  // 10% 샘플링
  beforeSend(event) {
    // PII 제거
    delete event.user?.ip_address;
    return event;
  }
});

// 사용자 행동 분석
posthog.init(process.env.POSTHOG_KEY, {
  api_host: 'https://app.posthog.com',
  capture_pageview: true,
  capture_pageleave: true
});

// 커스텀 이벤트
posthog.capture('search_query', {
  query: 'pizza',
  results_count: 42,
  clicked: true
});
```

---

## 🛠️ 개발 도구 & CI/CD

```typescript
const devStack = {
  frontend: {
    framework: "Next.js 15 + React 19",
    styling: "Tailwind CSS",
    components: "shadcn/ui",
    state: "Zustand (가벼움)"
  },

  backend: {
    api: "Next.js API Routes",
    database: "Supabase (PostgreSQL)",
    cache: "Upstash Redis",
    search: "Algolia"
  },

  deployment: {
    hosting: "Vercel",
    domain: "healthynow.app",
    cdn: "Vercel Edge Network",
    cost: "$20/month → $300/month (100K users)"
  },

  cicd: {
    github_actions: "자동 테스트",
    vercel: "자동 배포 (main branch)",
    preview: "PR마다 preview URL"
  }
};
```

---

## 🎯 기술적 의사결정 요약

| 결정 | 선택 | 이유 | 비용 |
|------|------|------|------|
| **검색** | Algolia | < 10ms, 관리 불필요 | $1/1K searches ($100/month) |
| **DB** | Supabase | PostgreSQL + Auth + Storage | $25/month |
| **캐시** | Upstash Redis | Serverless, 종량제 | $10/month |
| **호스팅** | Vercel | Edge Functions, 자동 확장 | $20/month |
| **모니터링** | Sentry + PostHog | 에러 추적 + 분석 | $50/month |
| **총 비용** | - | MVP 단계 | **$205/month** |
| **100K users** | - | 스케일 후 | **$2,000/month** |

---

## ✅ 다음 단계: 시뮬레이션 테스트

사용자 시나리오 기반 만족도 테스트 진행 →
