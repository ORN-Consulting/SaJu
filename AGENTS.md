# AGENTS.md — AI 에이전트 행동 규칙

> 이 문서는 하네스 엔지니어링에서 코드를 작성하는 AI 에이전트가 반드시 준수해야 할 행동 규칙입니다.
> 코드를 작성하기 전에 이 문서와 `ARCHITECTURE.md`를 반드시 먼저 읽으세요.

---

## 1. 문서 읽기 순서

작업을 시작하기 전에 아래 문서를 순서대로 읽으세요:

1. **이 문서** (`AGENTS.md`) — 행동 규칙
2. **`ARCHITECTURE.md`** — 시스템 구조, 기술 스택, 핵심 모듈
3. **관련 설계 문서** (`docs/design-docs/`) — 해당 작업과 관련된 설계 결정
4. **관련 기능 명세** (`docs/product-specs/`) — 해당 작업의 기능 요구사항

---

## 2. 자율성 범위

### 2.1 스스로 판단하고 실행해도 되는 것

| 영역 | 예시 |
|------|------|
| **UI 스타일링** | 색상 조정, 간격 수정, 반응형 개선, 애니메이션 추가 |
| **버그 수정** | 계산 오류, 렌더링 버그, 타입 에러 등 |
| **리팩토링** | 함수 분리, 중복 제거, 네이밍 개선, 성능 최적화 |
| **패키지 설치** | 필요한 npm 패키지 설치 (단, `package.json`에 명시) |
| **사주 계산 로직** | 오행 분석, 십성 산출, 용신 판단 등의 구현 및 수정 |
| **MVP 명세 구현** | 기능 명세 문서(`docs/product-specs/`)에 명시된 기능의 구현 |
| **외부 라이브러리 설치** | 필요한 npm 패키지 설치 (단, `package.json`에 명시) |

### 2.2 반드시 사람에게 승인을 받아야 하는 것

| 영역 | 이유 |
|------|------|
| **파일/폴더 구조 변경** | `ARCHITECTURE.md`의 디렉토리 구조와 일치해야 하므로 |
| **명세에 없는 기능 추가** | MVP 범위 확대는 프로덕트 결정이므로 (다크모드, SEO 페이지, 새 분석 기능 등) |
| **외부 API 연동** | 클라이언트 사이드 계산 원칙(`core-beliefs.md`)과 충돌 가능하므로 |

> ⚠️ 구조 변경 또는 기능 추가가 필요한 합리적인 이유가 있다면,
> 변경안과 근거를 먼저 제시하고 승인을 받은 후 진행하세요.

### 2.3 변경 기록 의무

자율 범위가 넓은 만큼, **모든 주요 변경은 반드시 기록**해야 합니다:

- 사주 계산 로직 변경 시 → 커밋 메시지에 변경 이유와 영향 범위 명시
- 새 기능 추가 시 → 커밋 메시지에 기능 설명 포함
- 새 패키지 설치 시 → 커밋 메시지에 패키지명과 설치 이유 명시
- 외부 연동 추가 시 → `ARCHITECTURE.md` 의존성 섹션 업데이트

---

## 3. 코딩 컨벤션

### 3.1 언어 및 타입

- **TypeScript strict mode** 필수
- `any` 타입 사용 금지 — 반드시 구체적인 타입 정의
- `as` 타입 단언 최소화 — 타입 가드 우선 사용
- `// @ts-ignore` 사용 금지

### 3.2 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 변수, 함수 | camelCase | `calculatePillar`, `fiveElements` |
| 타입, 인터페이스 | PascalCase | `SajuPillars`, `FiveElementsResult` |
| 상수 | UPPER_SNAKE_CASE | `STEMS`, `BRANCHES`, `ELEMENT_MAP` |
| 파일명 (컴포넌트) | PascalCase | `BirthInputForm.tsx` |
| 파일명 (모듈) | kebab-case 또는 camelCase | `five-elements.ts`, `calendar.ts` |
| CSS 클래스 | Tailwind 유틸리티 | `className="flex items-center"` |

### 3.3 import 순서

```typescript
// 1. 외부 라이브러리
import { Solar } from 'lunar-javascript';

// 2. 내부 모듈
import { calculatePillars } from '@/lib/saju/calendar';
import { analyzeFiveElements } from '@/lib/saju/five-elements';

// 3. 타입 (type-only import)
import type { Saju, Element } from '@/lib/saju/types';

// 4. 컴포넌트
import { PillarDisplay } from '@/components/PillarDisplay';

// 5. 스타일, 상수, 유틸
import { STEMS, BRANCHES } from '@/lib/saju/constants';
```

### 3.4 파일 구조

`ARCHITECTURE.md`의 디렉토리 구조를 반드시 준수합니다:

- UI 컴포넌트 → `components/`
- 사주 계산 로직 → `lib/saju/`
- 해석 데이터 → `data/interpretations/`
- 테스트 → `__tests__/saju/`

### 3.5 코드 품질

- `console.log` 금지 — 디버깅 후 반드시 제거
- ESLint, Prettier 설정 준수
- 사용하지 않는 import, 변수 금지
- 매직 넘버 금지 — 상수로 정의 (`constants.ts`)

---

## 4. 사주 도메인 규칙

### 4.1 용어 표기

| 항목 | 규칙 |
|------|------|
| **천간** | 한글 표기: 갑, 을, 병, 정, 무, 기, 경, 신, 임, 계 |
| **지지** | 한글 표기: 자, 축, 인, 묘, 진, 사, 오, 미, 신, 유, 술, 해 |
| **오행** | 순서 고정: 목 → 화 → 토 → 금 → 수 |
| **십성** | 비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인 |
| **한자 병기** | UI 표시 시 한글(한자) 형식: "갑(甲)", "목(木)" |

### 4.2 계산 정책

| 항목 | 정책 | 비고 |
|------|------|------|
| **자시 처리** | 야자시 방식 | 23:00~00:00는 당일의 자시로 처리 |
| **지장간** | 본기(本氣)만 사용 | 중기·여기는 MVP 이후 확장 |
| **절기 기준** | `lunar-javascript` 라이브러리 기준 | 절기 경계 시간대 주의 |
| **년주 기준** | 입춘(立春) 기준 | 양력 1월 1일이 아님 |
| **용신 판단** | 억부법(抑扶法) 기본 | 조후법, 통관법은 추후 확장 |

### 4.3 데이터 무결성

- 천간은 반드시 10개, 지지는 반드시 12개 — 누락·중복 금지
- 오행 매핑 테이블은 `constants.ts`에 단일 소스로 관리
- 사주 계산 결과는 항상 4개 기둥(년·월·일·시)이 모두 존재해야 함
- `null`이나 `undefined` 기둥이 있으면 에러로 처리

---

## 5. 해석 텍스트 규칙

### 5.1 문체

- **제목/레이블**: 격식체 ("오행 분석 결과", "용신 판단")
- **설명/해석**: 친근체 ("목(木)의 기운이 강해요", "물의 도움이 필요해요")

### 5.2 언어

- MVP는 **한국어 전용**
- 명리학 전문 용어는 한글(한자) 병기: "용신(用神)", "십성(十星)"
- 코드 내 주석과 변수명은 영어, 사용자에게 보이는 텍스트는 한국어

### 5.3 해석 데이터 관리

- 해석 텍스트는 `data/interpretations/` 디렉토리에 JSON으로 분리
- 코드 안에 해석 문자열을 직접 하드코딩하지 않음
- JSON 구조 예시:

```json
{
  "ten-gods": {
    "비견": {
      "title": "비견(比肩)",
      "description": "나와 같은 오행이에요. 독립심이 강하고 자존심이 높은 성향을 나타내요.",
      "keywords": ["독립", "자존심", "경쟁", "형제"]
    }
  }
}
```

---

## 6. 테스트 규칙

### 6.1 테스트 범위

- **핵심 로직 필수**: `lib/saju/` 아래 모든 모듈은 테스트 권장
  - `calendar.ts` — 만세력 계산 정확도
  - `five-elements.ts` — 오행 분포 산출
  - `ten-gods.ts` — 십성 매핑
  - `yongshin.ts` — 용신 판단 로직
- **UI 컴포넌트**: 테스트 선택 (요청 시)

### 6.2 테스트 검증 기준

- 유명인 사주 또는 명리학 서적의 예시 사주를 기준 데이터로 사용
- 기존 만세력 사이트(만세력닷컴 등)의 결과와 교차 검증
- 최소 **20건 이상**의 검증용 사주 데이터셋 구축

### 6.3 필수 경계값 테스트

- 절기 경계 (같은 날 절기 전후로 월주 변경)
- 야자시 경계 (23:00, 23:59, 00:00)
- 윤달 처리
- 연도 시작/끝 (입춘 전후)
- `lunar-javascript` 지원 범위 경계 연도

### 6.4 테스트 파일 위치

```
__tests__/saju/
├── calendar.test.ts        # 만세력 계산
├── five-elements.test.ts   # 오행 분석
├── ten-gods.test.ts        # 십성 산출
├── yongshin.test.ts        # 용신 판단
└── fixtures/
    └── known-saju.json     # 검증용 기준 데이터
```

---

## 7. 커밋 메시지 규칙

**Conventional Commits** 형식을 사용합니다:

```
<type>(<scope>): <description>

[optional body]
```

### 7.1 타입

| 타입 | 용도 |
|------|------|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 기능 변경 없는 코드 개선 |
| `style` | UI 스타일링 변경 |
| `test` | 테스트 추가/수정 |
| `docs` | 문서 변경 |
| `chore` | 빌드, 패키지, 설정 변경 |

### 7.2 스코프

| 스코프 | 대상 |
|--------|------|
| `calendar` | 만세력 계산 모듈 |
| `five-elements` | 오행 분석 모듈 |
| `ten-gods` | 십성 산출 모듈 |
| `yongshin` | 용신 판단 모듈 |
| `ui` | UI 컴포넌트 |
| `data` | 해석 데이터 |

### 7.3 예시

```
feat(calendar): 양력→음력 변환 및 사주팔자 산출 구현

- lunar-javascript 라이브러리 연동
- 야자시(23:00~00:00) 당일 처리 적용
- 입춘 기준 년주 산정 로직 추가

fix(ten-gods): 음간 상관 매핑 오류 수정

- 을목 일간의 상관이 병화로 잘못 매핑되던 문제
- 정확한 매핑: 을목 → 병화(식신), 정화(상관)

chore: lunar-javascript 패키지 설치

- 만세력 계산을 위한 음양력 변환 라이브러리
- 설치 이유: 절기, 천간지지, 음력 변환 기능 제공
```

---

## 8. 코드 문서화 (JSDoc)

### 8.1 모든 함수에 JSDoc 주석 작성

```typescript
/**
 * 양력 생년월일시를 사주팔자(四柱八字)로 변환한다.
 *
 * 절기 기준으로 년주와 월주를 산정하며,
 * 야자시(23:00~00:00)는 당일로 처리한다.
 *
 * @param input - 생년월일시 및 성별 정보
 * @returns 사주 네 기둥 (년주, 월주, 일주, 시주)
 * @throws {InvalidDateError} 유효하지 않은 날짜일 경우
 *
 * @example
 * const saju = calculatePillars({
 *   year: 1990, month: 3, day: 15,
 *   hour: 14, minute: 30,
 *   isLunar: false, gender: 'M'
 * });
 * // => { year: { stem: '경', branch: '오' }, ... }
 */
function calculatePillars(input: BirthInput): SajuPillars {
  // ...
}
```

### 8.2 명리학 용어 주석

사주 계산 함수에는 명리학 용어 설명을 주석으로 포함합니다:

```typescript
/**
 * 십성(十星)을 산출한다.
 *
 * 십성이란 일간(日干, 나)을 기준으로 다른 천간·지지와의 관계를 나타내는 것이다.
 * - 비화(比和): 같은 오행 → 비견(같은 음양), 겁재(다른 음양)
 * - 아생(我生): 내가 생하는 오행 → 식신(같은 음양), 상관(다른 음양)
 * - 아극(我剋): 내가 극하는 오행 → 편재(같은 음양), 정재(다른 음양)
 * - 극아(剋我): 나를 극하는 오행 → 편관(같은 음양), 정관(다른 음양)
 * - 생아(生我): 나를 생하는 오행 → 편인(같은 음양), 정인(다른 음양)
 */
function calculateTenGods(dayStem: Stem, pillars: SajuPillars): TenGodsResult {
  // ...
}
```

---

## 9. 에러 처리

### 9.1 입력 유효성 검사

```typescript
// 폼 단에서 먼저 검증
// - 미래 날짜 차단
// - 입력 허용 범위: 1920년 ~ 현재 연도 (birth-input.md 기준)
// - (참고: lunar-javascript는 1900~2100년 지원하나, 앱에서는 1920년부터 허용)
// - 음력 입력 시 존재하지 않는 날짜 차단
```

### 9.2 계산 에러

```typescript
// lunar-javascript 호출은 반드시 try-catch로 감싸기
// 에러 발생 시 사용자에게 친절한 안내 메시지 표시
// 에러 상세 정보는 console.error로 기록 (개발 환경에서만)
```

### 9.3 해석 매핑 누락

```typescript
// 해석 텍스트가 없는 경우 fallback 텍스트 표시
// 절대 빈 화면이나 undefined를 보여주지 않음
```

---

## 10. 체크리스트

코드를 제출하기 전에 아래 항목을 확인하세요:

- [ ] TypeScript strict mode에서 에러 없음
- [ ] ESLint, Prettier 통과
- [ ] `console.log` 제거
- [ ] 관련 테스트 작성 또는 기존 테스트 통과
- [ ] JSDoc 주석 작성
- [ ] Conventional Commits 형식의 커밋 메시지
- [ ] 사주 도메인 규칙 준수 (용어 표기, 계산 정책)
- [ ] 해석 텍스트는 JSON 파일에 분리
- [ ] `ARCHITECTURE.md` 디렉토리 구조 준수
- [ ] 새 패키지 설치 시 커밋 메시지에 이유 명시
