#!/bin/bash

# Real Food API Test Script
# Tests 10 branded foods with actual 1-serving nutrition data

echo "🧪 FitSwap Real Food API Test"
echo "======================================"
echo ""

# Test foods
foods=("Big Mac" "Whopper" "Pepperoni Pizza" "Italian BMT" "Turkey Breast" "Grilled Chicken Salad" "Caesar Salad" "Chicken Bowl" "Veggie Bowl" "Quarter Pounder with Cheese")

echo "Testing ${#foods[@]} foods:"
echo ""

for food in "${foods[@]}"; do
  echo "📍 Testing: $food"

  # Test nutrition API
  response=$(curl -s -X POST http://localhost:3000/api/nutrition \
    -H "Content-Type: application/json" \
    -d "{\"foodName\": \"$food\"}")

  # Extract key data
  calories=$(echo "$response" | grep -o '"calories":[0-9]*' | head -1 | cut -d: -f2)
  protein=$(echo "$response" | grep -o '"protein":[0-9.]*' | head -1 | cut -d: -f2)
  dataSource=$(echo "$response" | grep -o '"dataSource":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ "$dataSource" == "real-food-database" ]; then
    echo "  ✅ Source: REAL FOOD DATABASE"
    echo "  📊 Nutrition: ${calories} kcal, ${protein}g protein"
  else
    echo "  ⚠️  Source: USDA (fallback)"
    echo "  📊 Nutrition: ${calories} kcal, ${protein}g protein"
  fi

  # Test alternatives API
  alt_response=$(curl -s -X POST http://localhost:3000/api/alternatives \
    -H "Content-Type: application/json" \
    -d "{\"foodName\": \"$food\"}")

  alt_count=$(echo "$alt_response" | grep -o '"alternatives":\[' | wc -l)
  alt_source=$(echo "$alt_response" | grep -o '"dataSource":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ "$alt_source" == "real-food-database" ]; then
    # Count alternatives more accurately
    alt_count=$(echo "$alt_response" | grep -o '"name":"[^"]*"' | wc -l)
    alt_count=$((alt_count - 1)) # Subtract original food
    echo "  🔄 Alternatives: ${alt_count} from REAL FOOD DATABASE"
  else
    echo "  🔄 Alternatives: From USDA (fallback)"
  fi

  echo ""
  sleep 0.5 # Rate limiting
done

echo "======================================"
echo "✅ Test Complete!"
echo ""
echo "Expected Results:"
echo "  - Big Mac: 563 kcal (was 230 kcal ❌)"
echo "  - Pizza: 290 kcal per slice (was wrong)"
echo "  - Sandwich: 280-410 kcal (was 255 kcal ❌)"
echo ""
echo "All foods should show:"
echo "  ✅ Source: REAL FOOD DATABASE"
echo "  🔄 Alternatives: 1-3 items (not 5+)"
echo ""
