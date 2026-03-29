# CLAUDE.md — 사주분석 웹앱 에이전트 진입점

> 이 파일은 Claude Code가 세션 시작 시 자동으로 읽는 진입점입니다.
> 모든 작업의 출발점이며, 다른 문서로의 허브 역할을 합니다.

---

## 프로젝트 한 줄 요약

생년월일시를 입력하면 **전통 명리학 규칙 기반**으로 사주팔자를 계산하고 해석하는 **클라이언트 사이드 웹앱**.

---

## 새 세션 시작 시 행동 규칙

1. **현재 상태 파악**
   ```bash
   git log --oneline -10    # 최근 작업 확인
   npm run build 2>&1 | tail -5   # 빌드 상태 확인
   npm test 2>&1 | tail -10       # 테스트 상태 확인
   ```
2. **진행 상태 확인**: `TASKS.md`의 체크리스트에서 현재 Phase와 미완료 Task 확인
3. **중단된 작업이 있으면** 이어서 진행, 없으면 다음 미완료 Task부터 시작
4. **작업 완료 시** `TASKS.md`의 해당 항목을 체크하고 커밋

---

## 문서 읽기 순서 (필수)

작업 전 아래 문서를 순서대로 읽으세요:

| 순서 | 문서 | 역할 |
|------|------|------|
| 1 | **이 문서** (`CLAUDE.md`) | 진입점, 세션 시작 규칙 |
| 2 | `TASKS.md` | 현재 진행 상태, 다음 할 일 |
| 3 | `AGENTS.md` | 행동 규칙, 자율 범위, 코딩 컨벤션 |
| 4 | `ARCHITECTURE.md` | 시스템 구조, 모듈, 타입, 데이터 흐름 |
| 5 | 해당 작업 관련 설계 문서 | `docs/design-docs/` 아래 |
| 6 | 해당 작업 관련 기능 명세 | `docs/product-specs/` 아래 |

---

## 디렉토리 구조

```
SaJu/
├── CLAUDE.md                  # (이 파일) 에이전트 진입점
├── TASKS.md                   # 작업 분해 + 진행 상태
├── AGENTS.md                  # 에이전트 행동 규칙
├── ARCHITECTURE.md            # 시스템 아키텍처
│
├── docs/
│   ├── design-docs/           # 설계 결정 문서
│   │   ├── index.md
│   │   ├── core-beliefs.md
│   │   ├── saju-engine-design.md
│   │   ├── tech-stack-decisions.md
│   │   └── ui-design-decisions.md
│   │
│   └── product-specs/         # 기능 명세 문서
│       ├── index.md
│       ├── new-user-onboarding.md
│       ├── birth-input.md
│       ├── saju-result.md
│       └── error-states.md
│
├── saju-app/                  # (생성 예정) Next.js 앱 루트
│   ├── app/
│   ├── components/
│   ├── lib/saju/
│   ├── data/interpretations/
│   ├── __tests__/saju/
│   └── ...
│
└── .claude/
    └── settings.local.json
```

> 현재 문서들은 루트에 flat하게 있습니다.
> **Phase 0 (인프라 구축)** 에서 위 구조로 정리합니다.

---

## 핵심 원칙 (빠른 참조)

| 원칙 | 내용 | 상세 |
|------|------|------|
| **규칙 기반** | LLM 해석 아님. 명리학 규칙을 코드로 구현 | `core-beliefs.md` |
| **클라이언트 계산** | DB 없음, 서버 로직 없음, 브라우저에서 완결 | `ARCHITECTURE.md` |
| **비회원 일회성** | 로그인 없음, 데이터 저장 없음 | `core-beliefs.md` |
| **MVP 범위 엄수** | 명세에 없는 기능은 승인 필요 | `AGENTS.md` 2.2 |

---

## 기술 스택 (빠른 참조)

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js (App Router) |
| 언어 | TypeScript (strict mode) |
| 스타일링 | Tailwind CSS |
| 만세력 | lunar-javascript |
| 호스팅 | Vercel (무료 티어) |
| 테스트 | Vitest |
| 상태관리 | React useState (별도 라이브러리 없음) |

---

## 금지 사항 (빠른 참조)

- `any` 타입, `@ts-ignore`, `console.log` (디버깅 후 제거)
- 명세에 없는 기능 추가 (승인 없이)
- 외부 API 연동 (승인 없이)
- 파일/폴더 구조 변경 (승인 없이)
- 해석 텍스트 코드 내 하드코딩 (JSON 파일에 분리)
