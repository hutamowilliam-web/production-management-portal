#!/bin/bash
# Power Apps Integration Test Scripts
# Test the Power Apps integration endpoints

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3001"
API_TOKEN="your_jwt_token_here"  # Replace with actual token from login

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Power Apps Integration Test Suite${NC}"
echo -e "${BLUE}======================================${NC}\n"

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check${NC}"
echo "Endpoint: GET /api/power-apps/health"
curl -s -X GET "$BASE_URL/api/power-apps/health" | jq '.'
echo -e "\n"

# Test 2: Get Forms from Power Apps
echo -e "${BLUE}Test 2: Get Forms from Power Apps${NC}"
echo "Endpoint: GET /api/power-apps/forms"
echo "Headers: Authorization: Bearer \$TOKEN"
curl -s -X GET "$BASE_URL/api/power-apps/forms" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo -e "\n"

# Test 3: Get Responses from Power Apps
echo -e "${BLUE}Test 3: Get Responses from Power Apps${NC}"
echo "Endpoint: GET /api/power-apps/responses"
echo "Headers: Authorization: Bearer \$TOKEN"
curl -s -X GET "$BASE_URL/api/power-apps/responses" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo -e "\n"

# Test 4: Sync a Single Form
echo -e "${BLUE}Test 4: Sync a Single Form${NC}"
echo "Endpoint: POST /api/power-apps/sync-form"
echo "Body: { formId: 1 }"
curl -s -X POST "$BASE_URL/api/power-apps/sync-form" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"formId": 1}' | jq '.'
echo -e "\n"

# Test 5: Sync a Single Response
echo -e "${BLUE}Test 5: Sync a Single Response${NC}"
echo "Endpoint: POST /api/power-apps/sync-response"
echo "Body: { responseId: 1 }"
curl -s -X POST "$BASE_URL/api/power-apps/sync-response" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"responseId": 1}' | jq '.'
echo -e "\n"

# Test 6: Bulk Sync All Forms
echo -e "${BLUE}Test 6: Bulk Sync All Forms${NC}"
echo "Endpoint: POST /api/power-apps/sync-all-forms"
echo "Note: Requires ADMIN role"
curl -s -X POST "$BASE_URL/api/power-apps/sync-all-forms" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo -e "\n"

# Test 7: Bulk Sync All Responses
echo -e "${BLUE}Test 7: Bulk Sync All Responses${NC}"
echo "Endpoint: POST /api/power-apps/sync-all-responses"
echo "Note: Requires ADMIN role"
curl -s -X POST "$BASE_URL/api/power-apps/sync-all-responses" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo -e "\n"

# Test 8: Setup Webhooks
echo -e "${BLUE}Test 8: Setup Webhooks${NC}"
echo "Endpoint: POST /api/power-apps/setup-webhooks"
echo "Note: Requires ADMIN role"
curl -s -X POST "$BASE_URL/api/power-apps/setup-webhooks" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo -e "\n"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Test Suite Complete${NC}"
echo -e "${BLUE}======================================${NC}\n"

echo -e "${GREEN}Tips:${NC}"
echo "1. Replace \$API_TOKEN with actual JWT token from login"
echo "2. Tests 6-8 require ADMIN role"
echo "3. Ensure Power Apps credentials are configured in .env"
echo "4. Check logs for detailed error information"
echo "5. Use 'jq' for pretty JSON output (install: apt-get install jq)"
