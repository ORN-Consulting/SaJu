# ARCHITECTURE.md — 사주분석 웹앱

> 이 문서는 AI 에이전트(하네스 엔지니어링)가 코드를 작성할 때 참조하는 **시스템 전체 구조도**입니다.
> 모든 설계 결정의 근거와 각 모듈 간 관계를 정의합니다.

---

## 1. 시스템 개요

### 1.1 프로젝트 목표

사용자가 생년월일시를 입력하면 **사주팔자(四柱八字)**를 계산하고,
전통 명리학 규칙에 기반한 분석 결과를 제공하는 웹 애플리케이션.

### 1.2 핵심 설계 원칙

| 원칙 | 설명 |
|------|------|
| **규칙 기반 해석** | LLM에 의존하지 않음. 전통 명리학 이론을 코드로 직접 구현 |
| **클라이언트 사이드 계산** | DB 없이 브라우저에서 모든 계산 수행 (서버 부하 제로) |
| **비회원 일회성** | 로그인·회원가입 없음. 사용자 데이터를 저장하지 않음 |
| **저비용 운영** | 무료 티어로 운영 가능한 인프라 구성 |

### 1.3 MVP 범위

- ✅ 만세력 계산 (생년월일시 → 사주팔자)
- ✅ 오행(五行) 분포 분석
- ✅ 십성(十星) 산출
- ✅ 용신(用神) 판단
- ❌ 대운/세운 (2단계)
- ❌ 궁합 분석 (3단계)
- ❌ 회원 기능 (미정)

---

## 2. 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────┐
│                    Vercel (호스팅)                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│   ┌───────────────────────────────────────────┐     │
│   │           Next.js App (프론트엔드)          │     │
│   │                                           │     │
│   │   ┌─────────┐    ┌──────────────────┐     │     │
│   │   │  UI 레이어 │    │  사주 엔진 (Core) │     │     │
│   │   │  (React) │───▶│                  │     │     │
│   │   │         │    │  ┌──────────┐    │     │     │
│   │   │ • 입력폼  │    │  │ 만세력 계산 │    │     │     │
│   │   │ • 결과표시 │    │  │(lunar-js) │    │     │     │
│   │   │ • 오행차트 │    │  └──────────┘    │     │     │
│   │   │         │    │  ┌──────────┐    │     │     │
│   │   │         │    │  │ 오행 분석  │    │     │     │
│   │   │         │    │  └──────────┘    │     │     │
│   │   │         │    │  ┌──────────┐    │     │     │
│   │   │         │    │  │ 십성 산출  │    │     │     │
│   │   │         │    │  └──────────┘    │     │     │
│   │   │         │    │  ┌──────────┐    │     │     │
│   │   │         │    │  │ 용신 판단  │    │     │     │
│   │   │         │    │  └──────────┘    │     │     │
│   │   └─────────┘    └──────────────────┘     │     │
│   └───────────────────────────────────────────┘     │
│                                                     │
│   DB 없음 — 모든 계산은 클라이언트 사이드              │
└─────────────────────────────────────────────────────┘
```

---

## 3. 기술 스택

| 영역 | 기술 | 선택 근거 |
|------|------|----------|
| **프레임워크** | Next.js (App Router) | React 기반, SSG 가능, Vercel 최적화 |
| **언어** | TypeScript | 사주 계산 로직의 타입 안전성 확보 |
| **스타일링** | Tailwind CSS | 빠른 UI 개발, 반응형 기본 지원 |
| **만세력 라이브러리** | lunar-javascript | 음양력 변환, 절기 계산, 천간지지 지원 |
| **호스팅** | Vercel (무료 티어) | Next.js 네이티브 지원, 자동 배포 |
| **DB** | 없음 | 비회원 일회성 계산이므로 불필요 |
| **상태관리** | React state (useState) | 단순한 입력→계산→출력 흐름이므로 충분 |

---

## 4. 핵심 모듈 상세

### 4.1 만세력 계산 모듈 (`/lib/saju/calendar.ts`)

**책임**: 양력 생년월일시 → 사주팔자(네 기둥의 천간·지지) 변환

**입력**:
```typescript
interface BirthInput {
  year: number;      // 양력 연도
  month: number;     // 양력 월 (1-12)
  day: number;       // 양력 일
  hour: number;      // 시 (0-23)
  minute: number;    // 분 (0-59)
  isLunar: boolean;  // 음력 입력 여부
  gender: 'M' | 'F'; // 성별 (대운 순행/역행 결정용)
}
```

**출력**:
```typescript
interface SajuPillars {
  year:  { stem: Stem; branch: Branch };  // 년주
  month: { stem: Stem; branch: Branch };  // 월주
  day:   { stem: Stem; branch: Branch };  // 일주
  hour:  { stem: Stem; branch: Branch };  // 시주
}
```

**핵심 로직**:
- `lunar-javascript` 라이브러리로 양력→음력 변환 및 절기 기반 월주 산정
- 년주: 절기(입춘) 기준으로 연도 결정
- 월주: 절기 기준 월 결정 + 년간(年干)으로 월간(月干) 산출
- 일주: 만세력 조회
- 시주: 생시(生時)에 따른 지지 + 일간(日干)으로 시간(時干) 산출

**주의사항**:
- 절기 경계 시간대 처리 (같은 날이라도 절기 전후로 월주가 다름)
- 자시(子時, 23:00-01:00) 처리: 야자시/조자시 구분 정책 결정 필요

### 4.2 오행 분석 모듈 (`/lib/saju/five-elements.ts`)

**책임**: 사주팔자에서 오행(木火土金水) 분포 분석

**로직**:
1. 8글자(천간 4 + 지지 4)의 오행 매핑
2. 지지는 본기(本氣)의 오행만 반영 (MVP 범위 — 중기·여기는 2단계 확장)
3. 오행별 개수·비율 산출
4. 과다/부족 오행 판별

**출력**:
```typescript
interface FiveElementsResult {
  distribution: Record<Element, number>;  // 각 오행의 강도
  dominant: Element;    // 가장 강한 오행
  weak: Element;        // 가장 약한 오행
  balance: 'balanced' | 'imbalanced';  // 균형 여부
}
```

### 4.3 십성 산출 모듈 (`/lib/saju/ten-gods.ts`)

**책임**: 일간(日干)을 기준으로 나머지 7글자의 십성(十星) 산출

**십성 목록**: 비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인

**로직**:
1. 일간(나)과 각 글자의 오행 관계 파악 (상생/상극/비화)
2. 음양 관계에 따라 편(偏)/정(正) 구분
3. 십성별 의미 매핑

### 4.4 용신 판단 모듈 (`/lib/saju/yongshin.ts`)

**책임**: 사주의 균형을 맞추기 위해 필요한 오행(용신) 판단

**로직** (MVP 단계 — 억부법 기본):
1. 일간의 강약 판단 (득령·득지·득세 분석)
2. 신강(身強)이면 → 일간을 억제하는 오행이 용신
3. 신약(身弱)이면 → 일간을 돕는 오행이 용신
4. 희신(喜神), 기신(忌神) 산출

**주의사항**:
- 용신 판단은 명리학에서 가장 논쟁이 많은 영역
- MVP에서는 억부법(抑扶法) 기본 로직만 구현
- 추후 조후법(調候法), 통관법(通關法) 등 추가 가능

---

## 5. 디렉토리 구조

```
saju-app/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 메인 페이지 (입력 + 결과)
│   └── globals.css             # 전역 스타일
│
├── components/                 # UI 컴포넌트
│   ├── BirthInputForm.tsx      # 생년월일시 입력 폼
│   ├── SajuResult.tsx          # 사주 결과 전체 컨테이너
│   ├── PillarDisplay.tsx       # 사주 네 기둥 표시
│   ├── FiveElementsChart.tsx   # 오행 분포 차트
│   ├── TenGodsDisplay.tsx      # 십성 표시
│   └── YongshinDisplay.tsx     # 용신 결과 표시
│
├── lib/                        # 비즈니스 로직
│   └── saju/
│       ├── types.ts            # 공통 타입 정의
│       ├── constants.ts        # 천간/지지/오행 상수 테이블
│       ├── calendar.ts         # 만세력 계산
│       ├── five-elements.ts    # 오행 분석
│       ├── ten-gods.ts         # 십성 산출
│       ├── yongshin.ts         # 용신 판단
│       └── index.ts            # 통합 분석 함수
│
├── data/                       # 정적 데이터
│   └── interpretations/        # 해석 텍스트 (십성별, 용신별 해설)
│       ├── ten-gods.json
│       └── yongshin.json
│
├── __tests__/                  # 테스트
│   └── saju/
│       ├── calendar.test.ts
│       ├── five-elements.test.ts
│       ├── ten-gods.test.ts
│       └── yongshin.test.ts
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 6. 데이터 흐름

```
사용자 입력 (양력/음력 생년월일시, 성별)
       │
       ▼
┌──────────────────┐
│  calendar.ts     │  양력→음력 변환, 절기 판단, 사주팔자 산출
└──────┬───────────┘
       │ SajuPillars
       ▼
┌──────────────────┐
│ five-elements.ts │  팔자의 오행 분포 분석
└──────┬───────────┘
       │ FiveElementsResult
       ▼
┌──────────────────┐
│  ten-gods.ts     │  일간 기준 십성 산출
└──────┬───────────┘
       │ TenGodsResult
       ▼
┌──────────────────┐
│  yongshin.ts     │  오행 균형 분석 → 용신/희신/기신 판단
└──────┬───────────┘
       │ YongshinResult
       ▼
┌──────────────────┐
│  UI 렌더링       │  모든 결과를 종합하여 사용자에게 표시
└──────────────────┘
```

---

## 6-1. 통합 분석 함수 (`/lib/saju/index.ts`)

UI 컴포넌트가 호출하는 유일한 진입점이다. 내부에서 calendar → five-elements → ten-gods → yongshin 순서로 파이프라인을 실행한다.

```typescript
/** 통합 분석 함수 — UI에서 호출하는 유일한 진입점 */
function analyzeSaju(input: BirthInput): SajuAnalysisResult;

/** 통합 분석 입력 */
interface BirthInput {
  year: number;       // 양력 연도
  month: number;      // 양력 월 (1-12)
  day: number;        // 양력 일
  hour: number | null; // 시 (0-23), null이면 생시 모름
  minute: number;     // 분 (0-59), 시진 선택 시 해당 시진의 중간값
  isLunar: boolean;   // 음력 입력 여부
  isLeapMonth: boolean; // 윤달 여부 (음력일 때만 유효)
  gender: 'M' | 'F';  // 성별
}

/** 통합 분석 결과 — UI가 이 타입 하나만 받아서 전체 화면을 렌더링 */
interface SajuAnalysisResult {
  success: true;
  input: BirthInput;                    // 원본 입력 (요약 바 표시용)
  hasHour: boolean;                     // 시주 포함 여부
  pillars: SajuPillars;                 // 사주팔자 (4주 또는 3주)
  fiveElements: FiveElementsResult;     // 오행 분포
  tenGods: TenGodsResult;               // 십성 산출
  yongshin: YongshinResult;             // 용신 판단
  interpretation: InterpretationResult; // 조합된 해석 텍스트
}

/** 통합 분석 실패 */
interface SajuAnalysisError {
  success: false;
  errorCode: string;   // E001~E011
  message: string;     // 사용자 표시용 메시지
  solution: string;    // 해결 방법 안내
}

/** analyzeSaju의 실제 반환 타입 */
type SajuAnalysisResponse = SajuAnalysisResult | SajuAnalysisError;

/** 용신 결과 (상세) */
interface YongshinResult {
  dayStrength: '신강' | '신약';
  yongshin: Element;    // 용신 오행
  heeshin: Element;     // 희신 오행
  gishin: Element;      // 기신 오행
  details: {
    deukryeong: boolean;
    deukji: boolean;
    deukse: boolean;
    score: number;       // 0~3
  };
}

/** 조합된 해석 텍스트 */
interface InterpretationResult {
  dayStemNature: string;     // 일간 특성 텍스트
  fiveElementsSummary: string; // 오행 분포 한 줄 요약
  tenGodsSummary: string;    // 십성 해석 텍스트
  yongshinMeaning: string;   // 용신 의미 텍스트
  comprehensiveReading: string; // 종합 해석 (5~6문장)
}
```

### 에러 처리

```typescript
function analyzeSaju(input: BirthInput): SajuAnalysisResponse {
  try {
    const pillars = calculatePillars(input);
    const hasHour = input.hour !== null;
    const fiveElements = analyzeFiveElements(pillars, hasHour);
    const tenGods = calculateTenGods(pillars.day.stem, pillars, hasHour);
    const yongshin = determineYongshin(pillars.day.stem, pillars, fiveElements, hasHour);
    const interpretation = buildInterpretation(pillars, fiveElements, tenGods, yongshin);

    return { success: true, input, hasHour, pillars, fiveElements, tenGods, yongshin, interpretation };
  } catch (error) {
    console.error('[E011] 사주 계산 실패:', error);
    return { success: false, errorCode: 'E011', message: ERROR_MESSAGES.E011.message, solution: ERROR_MESSAGES.E011.solution };
  }
}
```

---

## 7. 핵심 데이터 타입 (`/lib/saju/types.ts`)

```typescript
// 천간 (10개)
type Stem = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';

// 지지 (12개)
type Branch = '자' | '축' | '인' | '묘' | '진' | '사'
            | '오' | '미' | '신' | '유' | '술' | '해';

// 오행
type Element = '목' | '화' | '토' | '금' | '수';

// 음양
type YinYang = '양' | '음';

// 십성
type TenGod = '비견' | '겁재' | '식신' | '상관'
            | '편재' | '정재' | '편관' | '정관'
            | '편인' | '정인';

// 기둥 하나
interface Pillar {
  stem: Stem;
  branch: Branch;
}

// 사주 전체
interface Saju {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}
```

---

## 8. 의존성

### 런타임 의존성
| 패키지 | 용도 | 비고 |
|--------|------|------|
| `next` | 프레임워크 | App Router 사용 |
| `react` / `react-dom` | UI | — |
| `lunar-javascript` | 만세력·음양력·절기 | 핵심 의존성 |
| `tailwindcss` | 스타일링 | — |

### 개발 의존성
| 패키지 | 용도 |
|--------|------|
| `typescript` | 타입 안전성 |
| `vitest` 또는 `jest` | 단위 테스트 |
| `eslint` / `prettier` | 코드 품질 |

---

## 9. 배포 구성

| 항목 | 설정 |
|------|------|
| **호스팅** | Vercel 무료 티어 |
| **빌드** | `next build` (SSG 우선) |
| **도메인** | Vercel 기본 도메인 (MVP) → 커스텀 도메인 (추후) |
| **환경변수** | 없음 (외부 API 호출 없음) |
| **CI/CD** | Vercel Git 연동 (push → 자동 배포) |

> MVP는 API 키나 서버 사이드 로직이 없으므로,
> `next export`로 완전한 정적 사이트 배포도 가능합니다.

---

## 10. 확장 로드맵

### 2단계 — 운세 흐름
- 대운(大運) 계산: 10년 단위 운세 흐름
- 세운(歲運) 계산: 연도별 운세
- 합·충·형·파 관계 분석

### 3단계 — 고급 기능
- 궁합(宮合) 분석: 두 사람의 사주 비교
- 신살(神煞): 역마, 도화, 화개 등
- 테마별 해석: 직업적성, 재물운, 건강운

### 4단계 — 사용자 기능 (선택)
- 회원가입 / 로그인 (Supabase Auth)
- 사주 결과 저장 및 이력 조회 (Supabase DB)
- 공유 기능 (결과 URL 생성)

---

## 11. 미결정 사항 (TODO)

- [x] 자시(子時) 처리 정책 → **야자시 방식 (당일)** — [saju-engine-design.md 섹션 1](./docs/design-docs/saju-engine-design.md) 참조
- [ ] `lunar-javascript` 라이브러리의 정확도 검증 범위 (몇 년 ~ 몇 년?)
- [ ] 용신 판단 알고리즘의 세부 규칙 (억부법 내 득령·득지·득세 판정 의사코드)
- [x] 지장간(藏干) 반영 깊이 → **MVP: 본기(本氣)만 사용** — [saju-engine-design.md 섹션 2](./docs/design-docs/saju-engine-design.md) 참조
- [x] 해석 텍스트의 톤 & 분량 → **제목 격식체 + 설명 친근체, 중간 분량** — [ui-design-decisions.md 섹션 5](./docs/design-docs/ui-design-decisions.md) 참조
- [ ] 다국어 지원 여부 (현재 한국어 전용, 추후 검토)
