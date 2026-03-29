# saju-engine-design.md — 사주 계산 엔진 설계 결정

> 사주 계산 엔진(`lib/saju/`)의 주요 설계 결정과 그 근거를 기록합니다.
> 명리학 이론 선택의 이유와 구현 방향을 정의합니다.

---

## 1. 자시(子時) 처리: 야자시 방식

### 결정

23:00~00:00(야자시)를 **당일의 자시**로 처리한다. 일주가 바뀌지 않는다.

### 선택지

| 방식 | 설명 | 일주 영향 |
|------|------|----------|
| **야자시 (선택)** | 23:00~00:00는 당일 자시 | 일주 유지 |
| 조자시 | 23:00부터 다음 날로 넘어감 | 일주 변경 |

### 근거

- 현대 명리학에서 야자시 방식이 주류로 사용된다.
- 대부분의 온라인 만세력 사이트가 야자시 방식을 채택하고 있다.
- 교차 검증 시 기준 사이트와 결과를 맞추기 위해 동일 방식을 사용한다.

### 구현 영향

- `calendar.ts`에서 23:00~23:59 입력 시 일주를 그대로 유지
- 시주의 지지는 자(子)로 설정, 시간(時干)은 당일 일간 기준으로 산출

---

## 2. 지장간: 본기(本氣)만 사용

### 결정

MVP에서는 지지의 **본기(本氣)만** 오행 분석에 반영한다. 중기(中氣), 여기(餘氣)는 제외한다.

### 선택지

| 깊이 | 포함 범위 | 복잡도 |
|------|----------|--------|
| **본기만 (선택)** | 지지 1개당 오행 1개 | 낮음 |
| 본기 + 중기 | 지지 1개당 오행 2개 | 중간 |
| 본기 + 중기 + 여기 | 지지 1개당 오행 3개 | 높음 |

### 근거

- MVP의 핵심 원칙 "접근성 > 정밀도"에 부합한다.
- 본기만으로도 오행 분포의 큰 흐름은 파악 가능하다.
- 중기·여기까지 반영하면 용신 판단 로직이 크게 복잡해진다.
- 추후 2단계에서 중기·여기를 추가할 때, 기존 구조를 확장하는 방식으로 대응 가능하다.

### 확장 계획

```typescript
// 현재 (MVP): 본기만
const BRANCH_ELEMENTS: Record<Branch, Element> = {
  '자': '수', '축': '토', '인': '목', ...
};

// 추후 (2단계): 본기 + 중기 + 여기
const BRANCH_HIDDEN_STEMS: Record<Branch, { main: Stem; middle?: Stem; residual?: Stem }> = {
  '자': { main: '계' },
  '축': { main: '기', middle: '계', residual: '신' },
  ...
};
```

---

## 3. 용신 판단: 억부법(抑扶法) 기본

### 결정

MVP에서는 **억부법**으로만 용신을 판단한다.

### 선택지

| 방법 | 원리 | 복잡도 |
|------|------|--------|
| **억부법 (선택)** | 일간의 강약을 보고, 강하면 억제, 약하면 부조 | 중간 |
| 조후법 | 계절(월지)의 한난조습을 보고 조절 | 높음 |
| 통관법 | 대립하는 오행 사이를 통관시키는 오행 | 높음 |
| 격국법 | 사주의 격(格)을 정하고 격에 맞는 용신 | 매우 높음 |

### 근거

- 억부법은 가장 기본적이고 직관적인 용신 판단법이다.
- 일간 강약 판단만으로 구현 가능하므로 MVP에 적합하다.
- 다른 방법들은 예외 케이스가 많고, 학파마다 이견이 크다.

### 일간 강약 판단 기준 (MVP)

#### 용어 정의

| 관계 | 설명 | 예시 (일간이 목(木)일 때) |
|------|------|------------------------|
| **비화(比和)** | 같은 오행 | 목(木) |
| **생아(生我)** | 나를 생하는 오행 | 수(水) → 목(木) |
| **아생(我生)** | 내가 생하는 오행 | 목(木) → 화(火) |
| **극아(剋我)** | 나를 극하는 오행 | 금(金) → 목(木) |
| **아극(我剋)** | 내가 극하는 오행 | 목(木) → 토(土) |

#### 세 가지 조건의 정확한 판정

**득령(得令)**: 월지의 본기(本氣) 오행이 일간에 우호적인가?

```
득령 = true if:
  BRANCH_MAIN_ELEMENT[월지] == STEM_ELEMENT[일간]     // 비화 (같은 오행)
  OR BRANCH_MAIN_ELEMENT[월지] == 일간을_생하는_오행    // 생아
```

예: 일간 갑(甲, 목) + 월지 해(亥, 수) → 수는 목을 생하므로 득령

**득지(得地)**: 4개 지지 중 일간과 같은 오행(비화)인 본기가 2개 이상인가?

```
득지 = true if:
  count(지지 4개의 BRANCH_MAIN_ELEMENT 중 == STEM_ELEMENT[일간]) >= 2

판정 범위: 년지, 월지, 일지, 시지 (4개 모두 포함)
비교 대상: 비화(같은 오행)만 해당. 생아(나를 생하는)는 포함하지 않음.
3주 분석 시: 년지, 월지, 일지 (3개 중 2개 이상)
```

예: 일간 갑(甲, 목) + 지지에 인(寅, 목)·묘(卯, 목) → 목 2개 → 득지

**득세(得勢)**: 일간 이외의 천간 3개 중 일간을 돕는 오행(비화 또는 생아)이 1개 이상인가?

```
득세 = true if:
  any(년간, 월간, 시간 중):
    STEM_ELEMENT[해당천간] == STEM_ELEMENT[일간]      // 비화
    OR STEM_ELEMENT[해당천간] == 일간을_생하는_오행     // 생아

판정 범위: 년간, 월간, 시간 (일간 자신은 제외)
3주 분석 시: 년간, 월간 (2개 중 1개 이상)
```

예: 일간 갑(甲, 목) + 월간 계(癸, 수) → 수는 목을 생하므로 득세

#### 신강/신약 판정

```
충족_수 = (득령 ? 1 : 0) + (득지 ? 1 : 0) + (득세 ? 1 : 0)

if (충족_수 >= 2) → 신강(身強)
if (충족_수 <= 1) → 신약(身弱)
```

#### 용신 결정

```
신강 → 용신 = 일간을 억제하는 오행 (아생 또는 아극 중 사주에 더 부족한 것)
  - 1순위: 아극(내가 극하는 오행) — 재성(財星) 역할
  - 2순위: 극아(나를 극하는 오행) — 관성(官星) 역할

신약 → 용신 = 일간을 돕는 오행 (비화 또는 생아 중 사주에 더 부족한 것)
  - 1순위: 생아(나를 생하는 오행) — 인성(印星) 역할
  - 2순위: 비화(같은 오행) — 비겁(比劫) 역할

"더 부족한 것" = FiveElementsResult.distribution에서 카운트가 더 작은 오행
동점 시 1순위를 선택
```

#### 희신(喜神), 기신(忌神) 산출

```
희신 = 용신을 생하는 오행 (용신의 생아 관계)
기신 = 용신을 극하는 오행 (용신의 극아 관계)
```

#### 구현 의사코드

```typescript
function determineYongshin(
  dayStem: Stem,
  pillars: SajuPillars,
  fiveElements: FiveElementsResult,
  hasHour: boolean
): YongshinResult {
  const dayElement = STEM_ELEMENT[dayStem];
  const generating = GENERATING_ELEMENT[dayElement];  // 나를 생하는 오행
  const monthMainElement = BRANCH_MAIN_ELEMENT[pillars.month.branch];

  // 득령
  const deukryeong = (monthMainElement === dayElement)
    || (monthMainElement === generating);

  // 득지
  const branches = hasHour
    ? [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch]
    : [pillars.year.branch, pillars.month.branch, pillars.day.branch];
  const sameElementCount = branches
    .filter(b => BRANCH_MAIN_ELEMENT[b] === dayElement).length;
  const deukji = sameElementCount >= 2;

  // 득세
  const otherStems = hasHour
    ? [pillars.year.stem, pillars.month.stem, pillars.hour.stem]
    : [pillars.year.stem, pillars.month.stem];
  const deukse = otherStems.some(s =>
    STEM_ELEMENT[s] === dayElement || STEM_ELEMENT[s] === generating
  );

  const score = (deukryeong ? 1 : 0) + (deukji ? 1 : 0) + (deukse ? 1 : 0);
  const isStrong = score >= 2;

  // 용신 결정
  const yongshin = isStrong
    ? selectWeakerOf(CONTROLLED_BY[dayElement], CONTROLLING[dayElement], fiveElements)
    : selectWeakerOf(generating, dayElement, fiveElements);

  return {
    dayStrength: isStrong ? '신강' : '신약',
    yongshin,
    heeshin: GENERATING_ELEMENT[yongshin],
    gishin: CONTROLLING_ELEMENT[yongshin],
    details: { deukryeong, deukji, deukse, score },
  };
}
```

### 확장 계획

- 2단계: 조후법 보조 적용 (특히 겨울·여름 사주)
- 3단계: 통관법, 격국론 선택적 적용

---

## 3-1. 월간(月干) 산출: 오호결원(五虎遁元)

### 결정

년간(年干)에 따라 인월(寅月, 1월)의 천간이 결정되며, 이후 월은 순서대로 진행한다.

### 매핑 테이블

| 년간 | 인월(1월) 시작 천간 | 규칙명 |
|------|-------------------|--------|
| 갑(甲)·기(己) | **병**(丙)인월 | 갑기지년 병작수 |
| 을(乙)·경(庚) | **무**(戊)인월 | 을경지년 무작수 |
| 병(丙)·신(辛) | **경**(庚)인월 | 병신지년 경작수 |
| 정(丁)·임(壬) | **임**(壬)인월 | 정임지년 임작수 |
| 무(戊)·계(癸) | **갑**(甲)인월 | 무계지년 갑작수 |

### 구현 의사코드

```typescript
// constants.ts에 정의
const MONTH_STEM_START: Record<Stem, Stem> = {
  '갑': '병', '기': '병',  // 갑·기년 → 병인월부터
  '을': '무', '경': '무',  // 을·경년 → 무인월부터
  '병': '경', '신': '경',  // 병·신년 → 경인월부터
  '정': '임', '임': '임',  // 정·임년 → 임인월부터
  '무': '갑', '계': '갑',  // 무·계년 → 갑인월부터
};

// calendar.ts에서 사용
function getMonthStem(yearStem: Stem, monthBranchIndex: number): Stem {
  const startStem = MONTH_STEM_START[yearStem];
  const startIndex = STEMS.indexOf(startStem);
  // monthBranchIndex: 0=인월(1월), 1=묘월(2월), ..., 11=축월(12월)
  return STEMS[(startIndex + monthBranchIndex) % 10];
}
```

> 참고: 여기서 "월"은 절기 기준 월이다. 인월(寅月)은 입춘~경칩, 묘월(卯月)은 경칩~청명 등.

---

## 3-2. 시간(時干) 산출: 오서결원(五鼠遁元)

### 결정

일간(日干)에 따라 자시(子時)의 천간이 결정되며, 이후 시진은 순서대로 진행한다.

### 매핑 테이블

| 일간 | 자시(子時) 시작 천간 | 규칙명 |
|------|-------------------|--------|
| 갑(甲)·기(己) | **갑**(甲)자시 | 갑기일 갑자시 |
| 을(乙)·경(庚) | **병**(丙)자시 | 을경일 병자시 |
| 병(丙)·신(辛) | **무**(戊)자시 | 병신일 무자시 |
| 정(丁)·임(壬) | **경**(庚)자시 | 정임일 경자시 |
| 무(戊)·계(癸) | **임**(壬)자시 | 무계일 임자시 |

### 구현 의사코드

```typescript
// constants.ts에 정의
const HOUR_STEM_START: Record<Stem, Stem> = {
  '갑': '갑', '기': '갑',  // 갑·기일 → 갑자시부터
  '을': '병', '경': '병',  // 을·경일 → 병자시부터
  '병': '무', '신': '무',  // 병·신일 → 무자시부터
  '정': '경', '임': '경',  // 정·임일 → 경자시부터
  '무': '임', '계': '임',  // 무·계일 → 임자시부터
};

// calendar.ts에서 사용
function getHourStem(dayStem: Stem, hourBranchIndex: number): Stem {
  const startStem = HOUR_STEM_START[dayStem];
  const startIndex = STEMS.indexOf(startStem);
  // hourBranchIndex: 0=자시, 1=축시, ..., 11=해시
  return STEMS[(startIndex + hourBranchIndex) % 10];
}
```

---

## 4. 년주 기준: 입춘(立春)

### 결정

년주는 **양력 1월 1일이 아닌 입춘(立春)** 기준으로 결정한다.

### 근거

- 명리학의 표준 관행이다. 거의 모든 명리학 서적과 사이트가 입춘 기준을 사용한다.
- `lunar-javascript` 라이브러리가 절기 데이터를 제공하므로 구현 가능하다.

### 구현 영향

- 1월~2월 초 생일의 경우, 입춘 이전이면 전년도 년주를 사용해야 한다.
- 입춘 날짜는 매년 다르므로 (보통 2월 3~5일), 라이브러리에서 정확한 절기 시각을 가져온다.

---

## 5. 십성 산출: 일간 기준

### 결정

십성은 **일간(日干, 나)**을 기준으로 나머지 7글자와의 관계를 산출한다.

### 관계 매핑

| 관계 | 같은 음양 | 다른 음양 |
|------|----------|----------|
| 같은 오행 (비화) | 비견 | 겁재 |
| 내가 생하는 오행 (아생) | 식신 | 상관 |
| 내가 극하는 오행 (아극) | 편재 | 정재 |
| 나를 극하는 오행 (극아) | 편관 | 정관 |
| 나를 생하는 오행 (생아) | 편인 | 정인 |

### 구현 참고

- 일간 자신은 십성이 없으므로 "일간" 또는 "나"로 표시한다.
- 3주 분석(생시 모름) 시 시주의 천간·지지 십성은 산출하지 않는다.
- 지지의 십성은 지지 자체의 오행(본기)으로 산출한다.

---

## 5-1. 오행 강도 계산 방식

### 결정

MVP에서는 **8글자(천간 4 + 지지 본기 4)의 오행을 단순 카운팅**한다. 가중치는 적용하지 않는다.

### 선택지

| 방식 | 설명 | 복잡도 |
|------|------|--------|
| **단순 카운팅 (선택)** | 8글자의 오행을 1:1로 셈 | 낮음 |
| 가중치 카운팅 | 천간·지지·지장간에 가중치 부여 | 중간 |
| 점수제 | 득령·득지 등을 점수화 | 높음 |

### 근거

- MVP 원칙 "접근성 > 정밀도"에 부합
- 사용자에게 "목이 4개, 수가 0개"처럼 직관적으로 전달 가능
- 가중치 방식은 학파마다 이견이 크므로 MVP에서는 제외

### 계산 범위

```
카운팅 대상 (총 8개):
  - 천간 4개: 년간, 월간, 일간, 시간 → 각각의 오행 1개씩
  - 지지 4개: 년지, 월지, 일지, 시지 → 각각의 본기(本氣) 오행 1개씩

카운팅 제외:
  - 지장간의 중기(中氣), 여기(餘氣)
  - 3주 분석 시: 시간(時干)과 시지(時支) 제외 → 총 6개로 카운팅
```

### 동점 처리

- `distribution`에서 동점인 오행이 있을 경우:
  - `dominant` (가장 강한 오행): 상생 순서(목→화→토→금→수)에서 **앞선 것**을 선택
  - `weak` (가장 약한 오행): 상생 순서에서 **뒤선 것**을 선택
- 모든 오행이 균등하게 분포하면 `balance: 'balanced'`

### 구현 의사코드

```typescript
function analyzeFiveElements(pillars: SajuPillars, hasHour: boolean): FiveElementsResult {
  const counts: Record<Element, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };

  // 천간 카운팅
  counts[STEM_ELEMENT[pillars.year.stem]]++;
  counts[STEM_ELEMENT[pillars.month.stem]]++;
  counts[STEM_ELEMENT[pillars.day.stem]]++;
  if (hasHour) counts[STEM_ELEMENT[pillars.hour.stem]]++;

  // 지지 본기 카운팅
  counts[BRANCH_MAIN_ELEMENT[pillars.year.branch]]++;
  counts[BRANCH_MAIN_ELEMENT[pillars.month.branch]]++;
  counts[BRANCH_MAIN_ELEMENT[pillars.day.branch]]++;
  if (hasHour) counts[BRANCH_MAIN_ELEMENT[pillars.hour.branch]]++;

  const elements: Element[] = ['목', '화', '토', '금', '수'];
  const maxCount = Math.max(...elements.map(e => counts[e]));
  const minCount = Math.min(...elements.map(e => counts[e]));

  // 동점 시 상생 순서에서 앞선 것 선택 (배열 순서가 곧 우선순위)
  const dominant = elements.find(e => counts[e] === maxCount)!;
  const weak = elements.findLast(e => counts[e] === minCount)!;

  return {
    distribution: counts,
    dominant,
    weak,
    balance: (maxCount - minCount <= 1) ? 'balanced' : 'imbalanced',
  };
}
```

### 균형 판정 기준

- `maxCount - minCount <= 1` → `'balanced'`
- 그 외 → `'imbalanced'`
- 이 기준은 MVP 단순화이며, 추후 더 정교한 판정 로직으로 확장 가능

---

## 6. 해석 텍스트: 조합 생성 방식

### 결정

해석 텍스트는 **미리 작성된 블록을 조합**하여 생성한다. LLM 생성이 아니다.

### 구조

```
최종 해석 = 일간 특성 블록
          + 오행 분포 블록
          + 용신 의미 블록
          + 실생활 연결 블록
```

### 근거

- 규칙 기반 원칙과 일관된다.
- 같은 사주면 항상 같은 해석이 나온다.
- JSON 파일로 관리하므로 해석 수정·추가가 코드 변경 없이 가능하다.

### 데이터 구조 예시

```json
{
  "day-stem": {
    "갑": {
      "nature": "큰 나무처럼 곧고 강직한 성격이에요.",
      "strong": "리더십이 강하고 추진력이 있어요.",
      "weak": "외유내강 스타일로, 겉으로는 부드럽지만 속은 단단해요."
    }
  },
  "yongshin": {
    "수": {
      "meaning": "수(水)는 지혜와 유연함을 상징해요.",
      "lifestyle": "학문이나 연구 분야에서 능력을 발휘할 수 있어요.",
      "direction": "북쪽 방향이 좋은 에너지를 가져다줄 수 있어요.",
      "season": "겨울이 당신에게 유리한 계절이에요."
    }
  }
}
```
