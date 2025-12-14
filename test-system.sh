#!/bin/bash

# HotelMe System Test Script
# Tests all backend endpoints and functionality

API_URL="http://localhost:3001"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "================================"
echo "HotelMe System Test"
echo "================================"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health)
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed (HTTP $response)${NC}"
fi
echo ""

# Test 2: Get All Hotels
echo "Test 2: Get All Hotels"
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/hotels)
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Get all hotels passed${NC}"
else
    echo -e "${RED}✗ Get all hotels failed (HTTP $response)${NC}"
fi
echo ""

# Test 3: Get Single Hotel
echo "Test 3: Get Single Hotel"
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/hotels/1)
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Get single hotel passed${NC}"
else
    echo -e "${RED}✗ Get single hotel failed (HTTP $response)${NC}"
fi
echo ""

# Test 4: Filter Hotels by Country
echo "Test 4: Filter Hotels by Country"
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/hotels?country=United%20States")
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Filter by country passed${NC}"
else
    echo -e "${RED}✗ Filter by country failed (HTTP $response)${NC}"
fi
echo ""

# Test 5: Get Filter Options
echo "Test 5: Get Filter Options"
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/hotels/filters/options)
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Get filter options passed${NC}"
else
    echo -e "${RED}✗ Get filter options failed (HTTP $response)${NC}"
fi
echo ""

# Test 6: Get Hotel Price
echo "Test 6: Get Hotel Price"
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/prices/hotel/1?checkIn=2025-12-20&checkOut=2025-12-23")
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Get hotel price passed${NC}"
else
    echo -e "${RED}✗ Get hotel price failed (HTTP $response)${NC}"
fi
echo ""

# Test 7: Get Price Range (may take time due to rate limiting)
echo "Test 7: Get Price Range (may take 5-10 seconds...)"
response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$API_URL/api/prices/range/1?startDate=2025-12-20&endDate=2025-12-25&nights=2")
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Get price range passed${NC}"
else
    echo -e "${RED}✗ Get price range failed (HTTP $response)${NC}"
fi
echo ""

# Test 8: Get Cheapest Dates (may take time due to rate limiting)
echo "Test 8: Get Cheapest Dates (may take 10-20 seconds...)"
response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$API_URL/api/prices/cheapest/1?startDate=2025-12-20&endDate=2025-12-30&nights=2")
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Get cheapest dates passed${NC}"
else
    echo -e "${RED}✗ Get cheapest dates failed (HTTP $response)${NC}"
fi
echo ""

# Test 9: Cache Statistics
echo "Test 9: Cache Statistics"
response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 $API_URL/api/cache/stats)
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Cache statistics passed${NC}"
else
    echo -e "${RED}✗ Cache statistics failed (HTTP $response)${NC}"
fi
echo ""

# Test 10: Multiple Hotels Price (may take time due to rate limiting)
echo "Test 10: Multiple Hotels Price (may take 10-15 seconds...)"
response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 -X POST $API_URL/api/prices/multiple \
  -H "Content-Type: application/json" \
  -d '{"hotelIds":["1","2","3"],"checkIn":"2025-12-20","checkOut":"2025-12-23"}')
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Multiple hotels price passed${NC}"
else
    echo -e "${RED}✗ Multiple hotels price failed (HTTP $response)${NC}"
fi
echo ""

# Display Cache Statistics
echo "================================"
echo "Cache Statistics:"
echo "================================"
curl -s $API_URL/api/cache/stats | python3 -m json.tool
echo ""

# Display Rate Limiter Status
echo "================================"
echo "Rate Limiter Status:"
echo "================================"
curl -s $API_URL/health | python3 -c "import sys, json; data = json.load(sys.stdin); print(json.dumps(data['rateLimiter'], indent=2))"
echo ""

echo "================================"
echo "All tests completed!"
echo "================================"
