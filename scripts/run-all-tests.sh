#!/bin/bash

# 모든 테스트를 실행하는 스크립트

set -e

echo "=========================================="
echo "Running All Tests"
echo "=========================================="
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED=0

# 1. 스키마 검증
echo -e "${YELLOW}1. Testing Schema Consistency...${NC}"
if npm run test:schema; then
    echo -e "${GREEN}✓ Schema consistency test passed${NC}\n"
else
    echo -e "${RED}✗ Schema consistency test failed${NC}\n"
    FAILED=1
fi

# 2. 기능 테스트
echo -e "${YELLOW}2. Testing Functionality...${NC}"
if npm run test:functionality; then
    echo -e "${GREEN}✓ Functionality test passed${NC}\n"
else
    echo -e "${RED}✗ Functionality test failed${NC}\n"
    FAILED=1
fi

# 3. UI 컴포넌트 테스트
echo -e "${YELLOW}3. Testing UI Components...${NC}"
if npm run test:ui; then
    echo -e "${GREEN}✓ UI components test passed${NC}\n"
else
    echo -e "${RED}✗ UI components test failed${NC}\n"
    FAILED=1
fi

# 4. 통합 테스트
echo -e "${YELLOW}4. Testing Integration...${NC}"
if npm run test:integration; then
    echo -e "${GREEN}✓ Integration test passed${NC}\n"
else
    echo -e "${RED}✗ Integration test failed${NC}\n"
    FAILED=1
fi

# 5. 스키마 검증 (Prisma)
echo -e "${YELLOW}5. Verifying Database Schema...${NC}"
if npm run verify-schema; then
    echo -e "${GREEN}✓ Database schema verification passed${NC}\n"
else
    echo -e "${RED}✗ Database schema verification failed${NC}\n"
    FAILED=1
fi

# 결과 요약
echo "=========================================="
echo "Test Summary"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
