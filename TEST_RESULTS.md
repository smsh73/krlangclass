# 테스트 결과 문서

## 테스트 실행 방법

### 개별 테스트 실행
```bash
# 스키마 일관성 테스트
npm run test:schema

# 기능 테스트
npm run test:functionality

# UI 컴포넌트 테스트
npm run test:ui

# 통합 테스트
npm run test:integration
```

### 전체 테스트 실행
```bash
npm run test:all
# 또는
./scripts/run-all-tests.sh
```

## 테스트 범위

### 1. 스키마 일관성 테스트 (`test:schema`)
- 모든 Prisma 모델 접근성 검증
- 관계(Relations) 정상 작동 확인
- 필수 필드 검증
- 제약 조건 테스트 (unique, foreign key)
- 데이터 타입 검증
- JSON 필드 검증

### 2. 기능 테스트 (`test:functionality`)
- 사용자 생성 및 인증
- 게임 점수 저장 및 조회
- 관리자 인증
- 커리큘럼 관리
- 레벨 테스트 저장
- 대화형 세션 관리
- 관리자 설정

### 3. UI 컴포넌트 테스트 (`test:ui`)
- 컴포넌트 파일 구조 검증
- Export/Import 확인
- 'use client' 지시어 검증
- UI 컴포넌트 존재 확인

### 4. 통합 테스트 (`test:integration`)
- 전체 사용자 워크플로우
- 관리자 워크플로우
- 데이터 무결성 (Cascade 삭제)
- 동시성 테스트
- JSON 필드 복잡 구조 처리

## 테스트 결과

테스트 실행 후 결과가 표시됩니다:
- ✓ 성공
- ✗ 실패 (에러 메시지 포함)
- ⚠ 경고

## 주의사항

- 데이터베이스 연결이 필요합니다
- 테스트는 실제 데이터베이스에 테스트 데이터를 생성합니다
- 테스트 완료 후 자동으로 정리됩니다
- 프로덕션 환경에서는 실행하지 마세요
