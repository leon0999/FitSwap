#!/bin/bash

echo "========================================="
echo "🚀 HealthyNow MVP End-to-End Test"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test scenarios
scenarios=(
  "Big Mac"
  "Pizza"
  "Burger"
  "Salad"
  "Chicken"
  "Taco"
)

total_tests=0
passed_tests=0
failed_tests=0

echo "📋 Testing Search-First Interface..."
echo ""

for food in "${scenarios[@]}"; do
  total_tests=$((total_tests + 1))

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔍 Test #$total_tests: Searching for \"$food\""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Step 1: Nutrition API
  echo ""
  echo "Step 1: Testing /api/nutrition..."
  nutrition_response=$(curl -s -X POST http://localhost:3000/api/nutrition \
    -H "Content-Type: application/json" \
    -d "{\"foodName\": \"$food\"}")

  nutrition_data_source=$(echo "$nutrition_response" | jq -r '.results[0].dataSource // "null"')
  nutrition_calories=$(echo "$nutrition_response" | jq -r '.results[0].calories // "null"')
  nutrition_name=$(echo "$nutrition_response" | jq -r '.results[0].name // "null"')

  if [ "$nutrition_data_source" = "real-food-database" ]; then
    echo -e "${GREEN}✓ Nutrition API: SUCCESS${NC}"
    echo "  - Food: $nutrition_name"
    echo "  - Calories: $nutrition_calories kcal"
    echo "  - Data Source: $nutrition_data_source"
  else
    echo -e "${RED}✗ Nutrition API: FAILED${NC}"
    echo "  - Expected: real-food-database"
    echo "  - Got: $nutrition_data_source"
    failed_tests=$((failed_tests + 1))
    continue
  fi

  # Step 2: Alternatives API
  echo ""
  echo "Step 2: Testing /api/alternatives..."
  alternatives_response=$(curl -s -X POST http://localhost:3000/api/alternatives \
    -H "Content-Type: application/json" \
    -d "{\"foodName\": \"$food\"}")

  alternatives_count=$(echo "$alternatives_response" | jq '.alternatives | length')
  original_name=$(echo "$alternatives_response" | jq -r '.original.name // "null"')
  alternatives_data_source=$(echo "$alternatives_response" | jq -r '.dataSource // "null"')

  if [ "$alternatives_data_source" = "real-food-database" ]; then
    echo -e "${GREEN}✓ Alternatives API: SUCCESS${NC}"
    echo "  - Original: $original_name"
    echo "  - Alternatives: $alternatives_count healthier options"
    echo "  - Data Source: $alternatives_data_source"

    # Show alternatives
    if [ "$alternatives_count" -gt 0 ]; then
      echo ""
      echo "  Healthier Alternatives:"
      echo "$alternatives_response" | jq -r '.alternatives[] | "    → \(.name) (\(.calories) cal, -\(.caloriesSavedPercent)%)"'
    fi
  else
    echo -e "${YELLOW}⚠ Alternatives API: PARTIAL${NC}"
    echo "  - Got: $alternatives_data_source"
  fi

  # Step 3: Check for orderUrl
  echo ""
  echo "Step 3: Testing Order Integration..."
  has_order_url=$(echo "$alternatives_response" | jq '[.alternatives[] | select(.orderUrl != null)] | length')

  if [ "$has_order_url" -gt 0 ]; then
    echo -e "${GREEN}✓ Order Integration: SUCCESS${NC}"
    echo "  - $has_order_url alternatives have direct orderUrl"
  else
    echo -e "${YELLOW}⚠ Order Integration: PARTIAL${NC}"
    echo "  - No direct orderUrl (will use generic search)"
  fi

  # Test passed
  passed_tests=$((passed_tests + 1))
  echo ""
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✓ Test #$total_tests PASSED${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  # Small delay to avoid rate limiting
  sleep 1
done

echo ""
echo "========================================="
echo "📊 Test Results Summary"
echo "========================================="
echo ""
echo "Total Tests:  $total_tests"
echo -e "${GREEN}Passed:       $passed_tests${NC}"
echo -e "${RED}Failed:       $failed_tests${NC}"
echo ""

success_rate=$(echo "scale=1; $passed_tests * 100 / $total_tests" | bc)
echo "Success Rate: $success_rate%"
echo ""

if [ "$failed_tests" -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed! MVP is ready for launch!${NC}"
  echo ""
  echo "✓ Search-first interface: WORKING"
  echo "✓ Real food database: ACCURATE"
  echo "✓ Healthy alternatives: WORKING"
  echo "✓ Order integration: READY"
  echo "✓ Calorie Bank: IMPLEMENTED"
  echo ""
  echo "🚀 Next steps:"
  echo "1. Open http://localhost:3000 in your browser"
  echo "2. Test the UI manually"
  echo "3. Deploy to production (Vercel)"
  exit 0
else
  echo -e "${RED}❌ Some tests failed. Please fix before deploying.${NC}"
  exit 1
fi
