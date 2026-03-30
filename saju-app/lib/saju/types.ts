/**
 * 사주분석 웹앱 — 핵심 타입 정의
 *
 * 이 파일은 ARCHITECTURE.md 섹션 7 및 섹션 6-1의 타입을 구현합니다.
 * 모든 사주 계산 모듈과 UI 컴포넌트가 이 타입들을 공유합니다.
 */

// ──────────────────────────────────────
// 기본 도메인 타입
// ──────────────────────────────────────

/** 천간 (10개) */
export type Stem = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';

/** 지지 (12개) */
export type Branch = '자' | '축' | '인' | '묘' | '진' | '사'
                   | '오' | '미' | '신' | '유' | '술' | '해';

/** 오행 (5개, 순서 고정: 목→화→토→금→수) */
export type Element = '목' | '화' | '토' | '금' | '수';

/** 음양 */
export type YinYang = '양' | '음';

/** 십성 (10개) */
export type TenGod = '비견' | '겁재' | '식신' | '상관'
                   | '편재' | '정재' | '편관' | '정관'
                   | '편인' | '정인';

/** 성별 */
export type Gender = 'M' | 'F';

// ──────────────────────────────────────
// 사주 구조
// ──────────────────────────────────────

/** 기둥 하나 (천간 + 지지) */
export interface Pillar {
  stem: Stem;
  branch: Branch;
}

/** 사주 전체 (4주) */
export interface SajuPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null; // null이면 생시 모름 (3주 분석)
}

// ──────────────────────────────────────
// 통합 분석 입출력 (ARCHITECTURE.md 섹션 6-1)
// ──────────────────────────────────────

/** 통합 분석 입력 */
export interface BirthInput {
  year: number;          // 양력 연도
  month: number;         // 양력 월 (1-12)
  day: number;           // 양력 일
  hour: number | null;   // 시 (0-23), null이면 생시 모름
  minute: number;        // 분 (0-59)
  isLunar: boolean;      // 음력 입력 여부
  isLeapMonth: boolean;  // 윤달 여부 (음력일 때만 유효)
  gender: Gender;        // 성별
}

/** 오행 분포 분석 결과 */
export interface FiveElementsResult {
  distribution: Record<Element, number>; // 각 오행의 개수 (단순 카운팅)
  dominant: Element;     // 가장 강한 오행
  weak: Element;         // 가장 약한 오행
  balance: 'balanced' | 'imbalanced'; // 균형 여부
}

/** 십성 산출 결과 */
export interface TenGodsResult {
  /** 각 위치의 십성 (일간 자신은 null) */
  yearStem: TenGod;
  yearBranch: TenGod;
  monthStem: TenGod;
  monthBranch: TenGod;
  dayStem: null;          // 일간 자신 — 십성 없음
  dayBranch: TenGod;
  hourStem: TenGod | null;   // 3주 분석 시 null
  hourBranch: TenGod | null; // 3주 분석 시 null
  /** 십성별 등장 횟수 */
  counts: Partial<Record<TenGod, number>>;
  /** 가장 많이 등장하는 십성 */
  dominant: TenGod;
}

/** 용신 판단 결과 */
export interface YongshinResult {
  dayStrength: '신강' | '신약';
  yongshin: Element;     // 용신 오행
  heeshin: Element;      // 희신 오행
  gishin: Element;       // 기신 오행
  details: {
    deukryeong: boolean; // 득령
    deukji: boolean;     // 득지
    deukse: boolean;     // 득세
    score: number;       // 0~3
  };
}

/** 조합된 해석 텍스트 */
export interface InterpretationResult {
  dayStemNature: string;        // 일간 특성 텍스트
  fiveElementsSummary: string;  // 오행 분포 한 줄 요약
  tenGodsSummary: string;       // 십성 해석 텍스트
  yongshinMeaning: string;      // 용신 의미 텍스트
  comprehensiveReading: string; // 종합 해석 (5~6문장)
}

// ──────────────────────────────────────
// 통합 분석 응답
// ──────────────────────────────────────

/** 통합 분석 성공 */
export interface SajuAnalysisResult {
  success: true;
  input: BirthInput;
  hasHour: boolean;
  pillars: SajuPillars;
  fiveElements: FiveElementsResult;
  tenGods: TenGodsResult;
  yongshin: YongshinResult;
  interpretation: InterpretationResult;
}

/** 통합 분석 실패 */
export interface SajuAnalysisError {
  success: false;
  errorCode: string;    // E001~E011
  message: string;      // 사용자 표시용
  solution: string;     // 해결 방법 안내
}

/** analyzeSaju()의 반환 타입 */
export type SajuAnalysisResponse = SajuAnalysisResult | SajuAnalysisError;

// ──────────────────────────────────────
// 입력 폼 에러
// ──────────────────────────────────────

/** 필드 에러 */
export interface FieldError {
  code: string;      // E001, E002, ...
  message: string;   // 사용자에게 보여줄 메시지
  solution: string;  // 해결 방법 안내 (없으면 빈 문자열)
}
