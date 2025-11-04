/**
 * Real Food Nutrition Database
 *
 * 실제 음식의 정확한 영양정보 (1인분/단품 기준)
 * 출처: 공식 브랜드 웹사이트, 영양성분표
 */

export interface RealFoodNutrition {
  name: string;
  brand?: string;
  serving: string; // 1인분 (예: "1 burger", "1 slice", "1 sandwich")
  servingWeight: number; // 그램
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
  sodium: number;
  source: string; // 데이터 출처
  category: 'burger' | 'pizza' | 'sandwich' | 'salad' | 'bowl' | 'drink' | 'dessert' | 'chicken' | 'taco' | 'breakfast';
  isOrganic?: boolean;
  isHealthy?: boolean;
  orderUrl?: string; // 주문 링크 (Uber Eats, DoorDash 등)
}

/**
 * 실제 음식 영양정보 데이터베이스
 */
export const REAL_FOOD_DATABASE: RealFoodNutrition[] = [
  // ==================== BURGERS ====================
  {
    name: 'Big Mac',
    brand: "McDonald's",
    serving: '1 burger',
    servingWeight: 219,
    calories: 563,
    protein: 25,
    carbs: 46,
    fat: 30,
    sugar: 9,
    fiber: 3,
    sodium: 1010,
    source: 'McDonald\'s Official Nutrition',
    category: 'burger',
    orderUrl: 'https://www.ubereats.com/store/mcdonalds',
  },
  {
    name: 'Whopper',
    brand: 'Burger King',
    serving: '1 burger',
    servingWeight: 290,
    calories: 657,
    protein: 28,
    carbs: 49,
    fat: 40,
    sugar: 11,
    fiber: 2,
    sodium: 980,
    source: 'Burger King Official Nutrition',
    category: 'burger',
    orderUrl: 'https://www.ubereats.com/store/burger-king',
  },
  {
    name: 'Quarter Pounder with Cheese',
    brand: "McDonald's",
    serving: '1 burger',
    servingWeight: 226,
    calories: 520,
    protein: 30,
    carbs: 41,
    fat: 26,
    sugar: 10,
    fiber: 2,
    sodium: 1110,
    source: 'McDonald\'s Official Nutrition',
    category: 'burger',
    orderUrl: 'https://www.ubereats.com/store/mcdonalds',
  },
  {
    name: 'Cheeseburger',
    brand: "McDonald's",
    serving: '1 burger',
    servingWeight: 120,
    calories: 300,
    protein: 15,
    carbs: 32,
    fat: 13,
    sugar: 7,
    fiber: 2,
    sodium: 720,
    source: 'McDonald\'s Official Nutrition',
    category: 'burger',
  },
  {
    name: 'Grilled Chicken Sandwich',
    brand: "McDonald's",
    serving: '1 sandwich',
    servingWeight: 213,
    calories: 380,
    protein: 37,
    carbs: 44,
    fat: 7,
    sugar: 11,
    fiber: 3,
    sodium: 1120,
    source: 'McDonald\'s Official Nutrition',
    category: 'sandwich',
    isHealthy: true,
  },

  // ==================== PIZZA ====================
  {
    name: 'Pepperoni Pizza',
    brand: 'Domino\'s',
    serving: '1 slice (medium)',
    servingWeight: 102,
    calories: 290,
    protein: 12,
    carbs: 32,
    fat: 12,
    sugar: 3,
    fiber: 2,
    sodium: 680,
    source: 'Domino\'s Official Nutrition',
    category: 'pizza',
  },
  {
    name: 'Cheese Pizza',
    brand: 'Domino\'s',
    serving: '1 slice (medium)',
    servingWeight: 95,
    calories: 270,
    protein: 11,
    carbs: 31,
    fat: 11,
    sugar: 3,
    fiber: 2,
    sodium: 590,
    source: 'Domino\'s Official Nutrition',
    category: 'pizza',
  },
  {
    name: 'Veggie Pizza',
    brand: 'Domino\'s',
    serving: '1 slice (medium)',
    servingWeight: 105,
    calories: 250,
    protein: 10,
    carbs: 32,
    fat: 9,
    sugar: 4,
    fiber: 3,
    sodium: 540,
    source: 'Domino\'s Official Nutrition',
    category: 'pizza',
    isHealthy: true,
  },
  {
    name: 'Hawaiian Pizza',
    brand: 'Pizza Hut',
    serving: '1 slice (medium)',
    servingWeight: 98,
    calories: 260,
    protein: 11,
    carbs: 30,
    fat: 10,
    sugar: 5,
    fiber: 2,
    sodium: 620,
    source: 'Pizza Hut Official Nutrition',
    category: 'pizza',
  },

  // ==================== SANDWICHES ====================
  {
    name: 'Italian BMT',
    brand: 'Subway',
    serving: '6-inch sub',
    servingWeight: 243,
    calories: 410,
    protein: 19,
    carbs: 42,
    fat: 18,
    sugar: 5,
    fiber: 2,
    sodium: 1260,
    source: 'Subway Official Nutrition',
    category: 'sandwich',
  },
  {
    name: 'Turkey Breast',
    brand: 'Subway',
    serving: '6-inch sub',
    servingWeight: 238,
    calories: 280,
    protein: 18,
    carbs: 41,
    fat: 3.5,
    sugar: 5,
    fiber: 2,
    sodium: 810,
    source: 'Subway Official Nutrition',
    category: 'sandwich',
    isHealthy: true,
  },
  {
    name: 'Veggie Delite',
    brand: 'Subway',
    serving: '6-inch sub',
    servingWeight: 166,
    calories: 230,
    protein: 8,
    carbs: 44,
    fat: 2.5,
    sugar: 5,
    fiber: 5,
    sodium: 280,
    source: 'Subway Official Nutrition',
    category: 'sandwich',
    isHealthy: true,
    isOrganic: true,
  },
  {
    name: 'Chicken & Bacon Ranch',
    brand: 'Subway',
    serving: '6-inch sub',
    servingWeight: 276,
    calories: 570,
    protein: 36,
    carbs: 43,
    fat: 28,
    sugar: 6,
    fiber: 2,
    sodium: 1320,
    source: 'Subway Official Nutrition',
    category: 'sandwich',
  },

  // ==================== SALADS ====================
  {
    name: 'Caesar Salad',
    brand: 'Panera Bread',
    serving: '1 salad',
    servingWeight: 324,
    calories: 330,
    protein: 11,
    carbs: 16,
    fat: 25,
    sugar: 3,
    fiber: 3,
    sodium: 830,
    source: 'Panera Bread Official Nutrition',
    category: 'salad',
  },
  {
    name: 'Greek Salad',
    brand: 'Panera Bread',
    serving: '1 salad',
    servingWeight: 338,
    calories: 380,
    protein: 10,
    carbs: 16,
    fat: 31,
    sugar: 7,
    fiber: 5,
    sodium: 900,
    source: 'Panera Bread Official Nutrition',
    category: 'salad',
    isHealthy: true,
  },
  {
    name: 'Grilled Chicken Salad',
    brand: 'Chick-fil-A',
    serving: '1 salad',
    servingWeight: 341,
    calories: 180,
    protein: 25,
    carbs: 9,
    fat: 6,
    sugar: 5,
    fiber: 3,
    sodium: 680,
    source: 'Chick-fil-A Official Nutrition',
    category: 'salad',
    isHealthy: true,
    isOrganic: true,
  },
  {
    name: 'Cobb Salad',
    brand: "Chick-fil-A",
    serving: '1 salad',
    servingWeight: 430,
    calories: 510,
    protein: 40,
    carbs: 27,
    fat: 28,
    sugar: 7,
    fiber: 5,
    sodium: 1360,
    source: 'Chick-fil-A Official Nutrition',
    category: 'salad',
  },

  // ==================== BOWLS ====================
  {
    name: 'Chicken Bowl',
    brand: 'Chipotle',
    serving: '1 bowl',
    servingWeight: 525,
    calories: 630,
    protein: 45,
    carbs: 62,
    fat: 21,
    sugar: 5,
    fiber: 11,
    sodium: 1420,
    source: 'Chipotle Official Nutrition',
    category: 'bowl',
  },
  {
    name: 'Veggie Bowl',
    brand: 'Chipotle',
    serving: '1 bowl',
    servingWeight: 498,
    calories: 430,
    protein: 16,
    carbs: 65,
    fat: 13,
    sugar: 10,
    fiber: 15,
    sodium: 1060,
    source: 'Chipotle Official Nutrition',
    category: 'bowl',
    isHealthy: true,
    isOrganic: true,
  },
  {
    name: 'Steak Bowl',
    brand: 'Chipotle',
    serving: '1 bowl',
    servingWeight: 525,
    calories: 650,
    protein: 43,
    carbs: 62,
    fat: 24,
    sugar: 5,
    fiber: 11,
    sodium: 1530,
    source: 'Chipotle Official Nutrition',
    category: 'bowl',
  },
  {
    name: 'Quinoa Bowl',
    brand: 'Sweetgreen',
    serving: '1 bowl',
    servingWeight: 400,
    calories: 520,
    protein: 18,
    carbs: 58,
    fat: 24,
    sugar: 12,
    fiber: 10,
    sodium: 520,
    source: 'Sweetgreen Official Nutrition',
    category: 'bowl',
    isHealthy: true,
    isOrganic: true,
  },

  // ==================== CHICKEN ====================
  {
    name: 'Original Recipe Chicken',
    brand: 'KFC',
    serving: '1 piece (breast)',
    servingWeight: 161,
    calories: 320,
    protein: 29,
    carbs: 11,
    fat: 18,
    sugar: 0,
    fiber: 1,
    sodium: 1020,
    source: 'KFC Official Nutrition',
    category: 'chicken',
    orderUrl: 'https://www.ubereats.com/store/kfc',
  },
  {
    name: 'Grilled Chicken Breast',
    brand: 'KFC',
    serving: '1 piece',
    servingWeight: 133,
    calories: 220,
    protein: 35,
    carbs: 0,
    fat: 8,
    sugar: 0,
    fiber: 0,
    sodium: 730,
    source: 'KFC Official Nutrition',
    category: 'chicken',
    isHealthy: true,
    orderUrl: 'https://www.ubereats.com/store/kfc',
  },
  {
    name: 'Popcorn Chicken',
    brand: 'KFC',
    serving: '1 serving',
    servingWeight: 128,
    calories: 410,
    protein: 20,
    carbs: 27,
    fat: 25,
    sugar: 0,
    fiber: 2,
    sodium: 1260,
    source: 'KFC Official Nutrition',
    category: 'chicken',
  },

  // ==================== TACOS ====================
  {
    name: 'Crunchy Taco',
    brand: 'Taco Bell',
    serving: '1 taco',
    servingWeight: 78,
    calories: 170,
    protein: 8,
    carbs: 13,
    fat: 10,
    sugar: 1,
    fiber: 3,
    sodium: 310,
    source: 'Taco Bell Official Nutrition',
    category: 'taco',
    orderUrl: 'https://www.ubereats.com/store/taco-bell',
  },
  {
    name: 'Soft Taco',
    brand: 'Taco Bell',
    serving: '1 taco',
    servingWeight: 99,
    calories: 180,
    protein: 9,
    carbs: 18,
    fat: 9,
    sugar: 2,
    fiber: 3,
    sodium: 500,
    source: 'Taco Bell Official Nutrition',
    category: 'taco',
  },
  {
    name: 'Bean Burrito',
    brand: 'Taco Bell',
    serving: '1 burrito',
    servingWeight: 198,
    calories: 350,
    protein: 13,
    carbs: 54,
    fat: 9,
    sugar: 4,
    fiber: 8,
    sodium: 1020,
    source: 'Taco Bell Official Nutrition',
    category: 'taco',
    isHealthy: true,
    orderUrl: 'https://www.ubereats.com/store/taco-bell',
  },
  {
    name: 'Chicken Power Bowl',
    brand: 'Taco Bell',
    serving: '1 bowl',
    servingWeight: 470,
    calories: 500,
    protein: 27,
    carbs: 51,
    fat: 20,
    sugar: 4,
    fiber: 7,
    sodium: 1280,
    source: 'Taco Bell Official Nutrition',
    category: 'bowl',
    isHealthy: true,
  },

  // ==================== BURGERS (추가 브랜드) ====================
  {
    name: "Dave's Single",
    brand: "Wendy's",
    serving: '1 burger',
    servingWeight: 268,
    calories: 570,
    protein: 30,
    carbs: 40,
    fat: 34,
    sugar: 9,
    fiber: 2,
    sodium: 1110,
    source: "Wendy's Official Nutrition",
    category: 'burger',
    orderUrl: 'https://www.ubereats.com/store/wendys',
  },
  {
    name: 'Jr. Hamburger',
    brand: "Wendy's",
    serving: '1 burger',
    servingWeight: 117,
    calories: 250,
    protein: 14,
    carbs: 26,
    fat: 10,
    sugar: 5,
    fiber: 1,
    sodium: 490,
    source: "Wendy's Official Nutrition",
    category: 'burger',
    isHealthy: true,
  },
  {
    name: 'Little Hamburger',
    brand: 'Five Guys',
    serving: '1 burger',
    servingWeight: 195,
    calories: 540,
    protein: 26,
    carbs: 39,
    fat: 30,
    sugar: 8,
    fiber: 2,
    sodium: 430,
    source: 'Five Guys Official Nutrition',
    category: 'burger',
  },

  // ==================== BREAKFAST ====================
  {
    name: 'Egg McMuffin',
    brand: "McDonald's",
    serving: '1 sandwich',
    servingWeight: 142,
    calories: 310,
    protein: 17,
    carbs: 30,
    fat: 13,
    sugar: 3,
    fiber: 2,
    sodium: 770,
    source: 'McDonald\'s Official Nutrition',
    category: 'breakfast',
    orderUrl: 'https://www.ubereats.com/store/mcdonalds',
  },
  {
    name: 'Bacon, Egg & Cheese Biscuit',
    brand: "McDonald's",
    serving: '1 sandwich',
    servingWeight: 144,
    calories: 460,
    protein: 19,
    carbs: 38,
    fat: 26,
    sugar: 4,
    fiber: 2,
    sodium: 1330,
    source: 'McDonald\'s Official Nutrition',
    category: 'breakfast',
  },
  {
    name: 'Egg White Delight',
    brand: "McDonald's",
    serving: '1 sandwich',
    servingWeight: 135,
    calories: 250,
    protein: 18,
    carbs: 29,
    fat: 7,
    sugar: 3,
    fiber: 2,
    sodium: 770,
    source: 'McDonald\'s Official Nutrition',
    category: 'breakfast',
    isHealthy: true,
  },

  // ==================== COFFEE & DRINKS ====================
  {
    name: 'Caffe Latte',
    brand: 'Starbucks',
    serving: '1 grande (16 oz)',
    servingWeight: 473,
    calories: 190,
    protein: 13,
    carbs: 19,
    fat: 7,
    sugar: 18,
    fiber: 0,
    sodium: 170,
    source: 'Starbucks Official Nutrition',
    category: 'drink',
  },
  {
    name: 'Iced Coffee',
    brand: 'Starbucks',
    serving: '1 grande (16 oz)',
    servingWeight: 473,
    calories: 80,
    protein: 1,
    carbs: 20,
    fat: 0,
    sugar: 19,
    fiber: 0,
    sodium: 10,
    source: 'Starbucks Official Nutrition',
    category: 'drink',
    isHealthy: true,
  },
];

/**
 * 음식 이름으로 실제 영양정보 검색
 */
export function findRealFoodNutrition(foodName: string): RealFoodNutrition | null {
  const normalized = foodName.toLowerCase().trim();

  // 정확한 매칭
  const exactMatch = REAL_FOOD_DATABASE.find(
    (food) => food.name.toLowerCase() === normalized ||
              food.name.toLowerCase().includes(normalized) ||
              normalized.includes(food.name.toLowerCase())
  );

  if (exactMatch) {
    return exactMatch;
  }

  // 브랜드 + 음식명 매칭
  const brandMatch = REAL_FOOD_DATABASE.find(
    (food) => {
      const fullName = `${food.brand?.toLowerCase()} ${food.name.toLowerCase()}`;
      return fullName.includes(normalized) || normalized.includes(fullName);
    }
  );

  if (brandMatch) {
    return brandMatch;
  }

  // 키워드 매칭 (예: "burger" → Big Mac)
  const keywords: Record<string, string[]> = {
    'burger': ['Big Mac', 'Whopper', 'Quarter Pounder', 'Cheeseburger', "Dave's Single", 'Jr. Hamburger'],
    'pizza': ['Pepperoni Pizza', 'Cheese Pizza', 'Veggie Pizza'],
    'sandwich': ['Italian BMT', 'Turkey Breast', 'Veggie Delite', 'Grilled Chicken Sandwich'],
    'salad': ['Grilled Chicken Salad', 'Greek Salad', 'Caesar Salad'],
    'bowl': ['Chicken Bowl', 'Veggie Bowl', 'Quinoa Bowl', 'Chicken Power Bowl'],
    'chicken': ['Original Recipe Chicken', 'Grilled Chicken Breast', 'Popcorn Chicken'],
    'taco': ['Crunchy Taco', 'Soft Taco', 'Bean Burrito'],
    'breakfast': ['Egg McMuffin', 'Egg White Delight'],
    'coffee': ['Caffe Latte', 'Iced Coffee'],
  };

  for (const [keyword, foodNames] of Object.entries(keywords)) {
    if (normalized.includes(keyword)) {
      const match = REAL_FOOD_DATABASE.find((food) => foodNames.includes(food.name));
      if (match) {
        return match;
      }
    }
  }

  return null;
}

/**
 * 카테고리별 건강한 대체 음식 추천 (3개만)
 */
export function getHealthyAlternatives(
  originalFood: RealFoodNutrition
): RealFoodNutrition[] {
  // 같은 카테고리에서 더 건강한 음식 찾기
  const alternatives = REAL_FOOD_DATABASE.filter(
    (food) =>
      food.category === originalFood.category &&
      food.name !== originalFood.name &&
      food.calories < originalFood.calories && // 칼로리가 더 낮고
      (food.isHealthy || food.protein >= originalFood.protein * 0.8) // 건강하거나 단백질 유지
  );

  // 점수 계산 (칼로리 절감 + 단백질 유지 + 오가닉)
  const scored = alternatives.map((food) => {
    const calorieReduction = originalFood.calories - food.calories;
    const proteinRatio = food.protein / Math.max(originalFood.protein, 1);
    const organicBonus = food.isOrganic ? 100 : 0;
    const healthyBonus = food.isHealthy ? 50 : 0;

    const score = calorieReduction * 0.5 + proteinRatio * 100 + organicBonus + healthyBonus;

    return { food, score };
  });

  // 점수 높은 순으로 정렬하여 상위 3개만 반환
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.food);
}

/**
 * 10개 테스트 케이스 (웹 검색 결과와 비교용)
 */
export const TEST_FOODS = [
  'Big Mac',
  'Whopper',
  'Pepperoni Pizza',
  'Italian BMT',
  'Turkey Breast',
  'Grilled Chicken Salad',
  'Caesar Salad',
  'Chicken Bowl',
  'Veggie Bowl',
  'Quarter Pounder with Cheese',
];
