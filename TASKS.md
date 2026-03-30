# TASKS.md — 작업 분해 및 진행 상태

> 에이전트는 세션 시작 시 이 파일을 읽고, 미완료 Task를 순서대로 진행합니다.
> Task 완료 시 체크박스를 `[x]`로 변경하고 커밋합니다.

---

## Phase 0: 인프라 구축

### Task 0-1: 문서 디렉토리 정리
- [x] `docs/design-docs/` 생성 후 설계 문서 이동 (core-beliefs, saju-engine-design, tech-stack-decisions, ui-design-decisions, design-docs/index.md)
- [x] `docs/product-specs/` 생성 후 기능 명세 이동 (index, new-user-onboarding, birth-input, saju-result, error-states)
- [x] 문서 내 상대 경로 참조가 있으면 갱신
- [x] CLAUDE.md, TASKS.md, AGENTS.md, ARCHITECTURE.md는 루트에 유지

**완료 조건**: 모든 문서가 `docs/` 하위에 정리되고, 문서 간 링크가 깨지지 않음

### Task 0-2: git 초기화
- [x] `git init`
- [x] `.gitignore` 생성 (node_modules, .next, .env, .DS_Store, *.tsbuildinfo)
- [x] 현재 상태를 초기 커밋: `chore: 프로젝트 초기화 — 설계 문서 및 하네스 구성`

**완료 조건**: `git status`가 clean, `git log`에 초기 커밋 존재

### Task 0-3: Next.js 프로젝트 생성
- [x] `saju-app/` 디렉토리에 `create-next-app` 실행 (TypeScript, Tailwind, App Router, ESLint)
- [x] `tsconfig.json`에 strict mode 확인
- [x] `vitest` 설치 및 기본 설정
- [x] `lunar-javascript` 설치
- [x] `npm run build` 성공 확인
- [x] 커밋: `chore: Next.js 프로젝트 스캐폴딩`
- 참고: Next.js 16은 한국어 경로에서 Turbopack UTF-8 버그 → Next.js 15 (Webpack) 사용

**완료 조건**: `npm run build` 성공, `npm run dev`로 localhost 접속 가능

---

## Phase 1: 데이터 레이어

### Task 1-1: 타입 정의 (`lib/saju/types.ts`)
- [ ] `ARCHITECTURE.md` 섹션 7의 모든 타입 구현: Stem, Branch, Element, YinYang, TenGod, Pillar, Saju
- [ ] `ARCHITECTURE.md` 섹션 6-1의 통합 타입 구현: BirthInput, SajuAnalysisResult, SajuAnalysisError, SajuAnalysisResponse, YongshinResult, InterpretationResult, FiveElementsResult, TenGodsResult
- [ ] TypeScript strict 컴파일 통과

**완료 조건**: `npx tsc --noEmit` 에러 없음

### Task 1-2: 상수 테이블 (`lib/saju/constants.ts`)
- [ ] STEMS (천간 10개 배열)
- [ ] BRANCHES (지지 12개 배열)
- [ ] STEM_ELEMENT: 천간→오행 매핑 (갑→목, 을→목, 병→화, ...)
- [ ] STEM_YINYANG: 천간→음양 매핑 (갑→양, 을→음, ...)
- [ ] BRANCH_MAIN_ELEMENT: 지지→본기 오행 매핑 (자→수, 축→토, ...)
- [ ] ELEMENT_CYCLE: 상생 관계 (목→화→토→금→수→목)
- [ ] ELEMENT_CONTROL: 상극 관계 (목→토, 토→수, ...)
- [ ] GENERATING_ELEMENT: 나를 생하는 오행 매핑 (목←수, 화←목, ...)
- [ ] CONTROLLING_ELEMENT: 나를 극하는 오행 매핑 (목←금, 화←수, ...)
- [ ] MONTH_STEM_START: 오호결원 매핑 (`saju-engine-design.md` 섹션 3-1)
- [ ] HOUR_STEM_START: 오서결원 매핑 (`saju-engine-design.md` 섹션 3-2)
- [ ] HANJA 매핑: 한글→한자 (갑→甲, 자→子, 목→木, ...)
- [ ] TypeScript strict 컴파일 통과
- [ ] 천간 10개, 지지 12개, 오행 5개 — 누락·중복 없음 확인

**완료 조건**: 모든 매핑이 빈 값 없이 정의됨, `npx tsc --noEmit` 통과

### Task 1-3: 에러 상수 (`lib/errors.ts`)
- [ ] `error-states.md` 섹션 7의 에러 코드 전체 구현 (E001~F001)
- [ ] ERROR_MESSAGES 객체: `{ code, message, solution }` 구조

**완료 조건**: `error-states.md`의 모든 에러 코드가 상수에 존재

### Task 1-4: 해석 텍스트 (`data/interpretations/`)
- [ ] `day-stems.json` — 10천간별 특성 텍스트 (nature, strong, weak)
- [ ] `ten-gods.json` — 10십성별 해석 텍스트 (title, description, keywords)
- [ ] `yongshin.json` — 5오행별 용신 해석 (meaning, lifestyle, direction, season)
- [ ] `five-elements.json` — 오행 과다/부족 시 한 줄 요약 템플릿
- [ ] fallback 텍스트 포함

**완료 조건**: 모든 JSON이 유효하고, 빈 문자열이 없음

---

## Phase 2: 계산 엔진

### Task 2-1: 만세력 계산 (`lib/saju/calendar.ts`)
- [ ] `calculatePillars(input: BirthInput): SajuPillars` 구현
- [ ] lunar-javascript 연동: 양력→음력 변환, 절기 판정
- [ ] 년주: 입춘 기준 년도 결정 + 년간·년지
- [ ] 월주: 절기 기준 월 결정 + 오호결원으로 월간 산출
- [ ] 일주: 만세력 조회
- [ ] 시주: 시진→지지 매핑 + 오서결원으로 시간 산출
- [ ] 야자시(23:00~23:59) 처리: 당일 자시, 일주 유지
- [ ] 생시 모름(hour === null): 시주 제외, 3주 반환
- [ ] 음력 입력 처리 (윤달 포함)
- [ ] 테스트: `__tests__/saju/calendar.test.ts`
  - [ ] 검증 데이터셋 (`__tests__/saju/fixtures/known-saju.json`) 전수 통과
  - [ ] 야자시 경계 (23:00, 23:30, 23:59)
  - [ ] 절기 경계 (입춘 당일 전후)
  - [ ] 윤달 입력
  - [ ] 생시 모름 모드

**완료 조건**: 검증 데이터셋 전수 통과, 경계값 테스트 통과, `npm test calendar` green

### Task 2-2: 오행 분석 (`lib/saju/five-elements.ts`)
- [ ] `analyzeFiveElements(pillars, hasHour): FiveElementsResult` 구현
- [ ] `saju-engine-design.md` 섹션 5-1 의사코드 기반 구현
- [ ] 8글자 단순 카운팅 (3주 시 6글자)
- [ ] 동점 처리 (상생 순서 우선)
- [ ] 균형 판정 (maxCount - minCount <= 1)
- [ ] 테스트: 검증 데이터셋 기반 오행 분포 검증

**완료 조건**: 검증 데이터와 오행 카운트 일치, `npm test five-elements` green

### Task 2-3: 십성 산출 (`lib/saju/ten-gods.ts`)
- [ ] `calculateTenGods(dayStem, pillars, hasHour): TenGodsResult` 구현
- [ ] `saju-engine-design.md` 섹션 5 관계 매핑 (비화/아생/아극/극아/생아 + 음양)
- [ ] 일간 자신은 "일간" 표시
- [ ] 지지는 본기 오행으로 십성 산출
- [ ] 3주 분석 시 시주 십성 제외
- [ ] 테스트: 검증 데이터셋 기반 십성 검증

**완료 조건**: 검증 데이터와 십성 일치, `npm test ten-gods` green

### Task 2-4: 용신 판단 (`lib/saju/yongshin.ts`)
- [ ] `determineYongshin(dayStem, pillars, fiveElements, hasHour): YongshinResult` 구현
- [ ] `saju-engine-design.md` 섹션 3 의사코드 기반: 득령·득지·득세 판정
- [ ] 신강/신약 판정 (충족_수 >= 2)
- [ ] 용신·희신·기신 산출
- [ ] 테스트: 검증 데이터셋 기반 용신 검증

**완료 조건**: 검증 데이터와 신강/신약·용신 일치, `npm test yongshin` green

### Task 2-5: 통합 함수 (`lib/saju/index.ts`)
- [ ] `analyzeSaju(input): SajuAnalysisResponse` 구현
- [ ] `ARCHITECTURE.md` 섹션 6-1 시그니처 준수
- [ ] 파이프라인: calendar → five-elements → ten-gods → yongshin → interpretation
- [ ] 해석 텍스트 조합 (`buildInterpretation`)
- [ ] try-catch 에러 처리 → SajuAnalysisError 반환
- [ ] 통합 테스트: 입력→전체 결과 end-to-end

**완료 조건**: 검증 데이터 전수 통과 (입력→전체 출력), `npm test` all green

---

## Phase 3: UI

### Task 3-1: 레이아웃 + 헤더 + 푸터
- [ ] `app/layout.tsx` — 메타데이터, 폰트, 전역 스타일
- [ ] `app/globals.css` — Tailwind 기본 + 오행 색상 CSS 변수
- [ ] `components/Header.tsx` — 로고(플레이스홀더) + 네비 링크
- [ ] `components/Footer.tsx` — 저작권 + 면책 문구
- [ ] `lib/brand.ts` — BRAND 상수 (앱 이름, 태그라인)
- [ ] 반응형 확인 (모바일/데스크톱)

**완료 조건**: `/` 접속 시 헤더·푸터 렌더링, 반응형 레이아웃 정상

### Task 3-2: 히어로 + 특징 카드
- [ ] `components/HeroSection.tsx` — 헤드라인, 서브텍스트, CTA
- [ ] `components/FeatureCards.tsx` — 3개 카드 (전통 명리학, 가입 없이, 무료)
- [ ] CTA 클릭 → 입력 폼으로 smooth scroll
- [ ] 순차 페이드인 애니메이션
- [ ] `prefers-reduced-motion` 대응

**완료 조건**: 랜딩 영역 렌더링, CTA 스크롤 동작, 애니메이션 정상

### Task 3-3: 생년월일시 입력 폼
- [ ] `components/BirthInputForm.tsx`
- [ ] 양력/음력 토글 (음력 시 윤달 체크박스)
- [ ] 연/월/일 셀렉트박스 (일수 동적 변경)
- [ ] 시진 선택 (12시진 + 모름) / 정확한 시간 입력 토글
- [ ] 성별 선택
- [ ] "사주 분석하기" 버튼 (필수 항목 미입력 시 disabled)
- [ ] 인라인 유효성 검사 (`error-states.md` E001~E010)
- [ ] 반응형 (모바일 1열, 데스크톱 카드 중앙)
- [ ] 접근성 (label, aria-live, 키보드 탐색)

**완료 조건**: 모든 입력 조합 동작, 유효성 에러 표시, 버튼 활성화 조건 정상

### Task 3-4: 사주팔자 카드
- [ ] `components/PillarCard.tsx` — 천간·지지·오행색상·십성 표시
- [ ] `components/PillarDisplay.tsx` — 4장 가로 배치 (시주→년주)
- [ ] 일간 강조 스타일
- [ ] 3주 분석 시 3장만 표시
- [ ] 카드 순차 페이드인

**완료 조건**: 4주/3주 모드 렌더링, 오행 색상·십성 표시 정확

### Task 3-5: 오행 분포 차트
- [ ] `components/FiveElementsChart.tsx`
- [ ] 레이더 차트 (Recharts 또는 SVG)
- [ ] 차트 아래 텍스트 보충 (오행별 개수, 가장 강한/약한)
- [ ] 한 줄 요약 문장
- [ ] 오행 색상 일관 적용
- [ ] `aria-label` 수치 정보

**완료 조건**: 차트 렌더링, 수치 정확, 색상 일관, 접근성 레이블 존재

### Task 3-6: 십성 분석
- [ ] `components/TenGodsAnalysis.tsx`
- [ ] 등장 십성 배지 (개수 표시, 많은 순)
- [ ] 각 십성별 해석 텍스트 (JSON에서 로드)
- [ ] 미등장 십성 생략 또는 회색 처리

**완료 조건**: 십성 배지 + 해석 텍스트 렌더링, fallback 동작

### Task 3-7: 용신 결과 + 종합 해석
- [ ] `components/YongshinResult.tsx`
- [ ] 용신 카드 (용신·희신·기신, 일간 강약)
- [ ] 종합 해석 텍스트 (5~6문장, JSON 블록 조합)

**완료 조건**: 용신 카드 + 종합 해석 렌더링, 텍스트 빈 값 없음

### Task 3-8: 결과 컨테이너 + 애니메이션
- [ ] `components/SajuResult.tsx` — 전체 결과 컨테이너
- [ ] `components/InputSummaryBar.tsx` — 입력 요약 바
- [ ] 섹션별 순차 페이드인 (200ms 간격)
- [ ] "다시 분석하기" 버튼 → 입력 폼으로 스크롤 + 결과 초기화
- [ ] `prefers-reduced-motion` 대응

**완료 조건**: 분석 후 결과 전체 표시, 애니메이션 정상, 재분석 동작

### Task 3-9: 에러 카드 + 주의 배너
- [ ] `components/ErrorCard.tsx` — 계산 실패 시 표시
- [ ] `components/WarningBanner.tsx` — 절기 경계(W001), 3주 분석(W002)
- [ ] "다시 분석하기" 버튼

**완료 조건**: 에러/경고 상태 렌더링, 정상 결과와 상호 배타적 표시

---

## Phase 4: 통합 + 배포

### Task 4-1: 페이지 통합
- [ ] `app/page.tsx` — 모든 컴포넌트 조합
- [ ] 입력 → analyzeSaju() 호출 → 결과 state 업데이트 → 스크롤 → 결과 표시
- [ ] 에러 시 ErrorCard 표시
- [ ] 재분석 시 결과 초기화

**완료 조건**: 전체 사용자 흐름 (입력→분석→결과→재분석) 동작

### Task 4-2: 반응형 + 접근성 점검
- [ ] 모바일 (< 640px) 레이아웃 확인
- [ ] 태블릿 (640~1024px) 레이아웃 확인
- [ ] 데스크톱 (> 1024px) 레이아웃 확인
- [ ] 키보드 탐색 (Tab, Enter)
- [ ] 스크린리더 (`aria-label`, `aria-live`, `role`)
- [ ] `prefers-reduced-motion` 확인
- [ ] 오행 색상 + 텍스트 이중 표시

**완료 조건**: 3개 뷰포트에서 레이아웃 정상, 접근성 항목 통과

### Task 4-3: SEO 메타데이터
- [ ] `app/layout.tsx`에 title, description, keywords, openGraph 설정
- [ ] `new-user-onboarding.md` 섹션 10 기준

**완료 조건**: 빌드 후 HTML head에 메타태그 존재

### Task 4-4: Vercel 배포
- [ ] GitHub 저장소 연결
- [ ] Vercel 프로젝트 생성 + 배포
- [ ] 배포 URL 접속 확인

**완료 조건**: 배포 URL에서 전체 기능 동작

---

## 현재 진행 상태

**현재 Phase**: Phase 0 완료 → Phase 1 시작
**마지막 완료 Task**: Task 0-3 (Next.js 프로젝트 생성)
**다음 할 일**: Task 1-1 (타입 정의 lib/saju/types.ts)
