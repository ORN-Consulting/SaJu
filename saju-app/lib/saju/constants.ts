/**
 * 사주분석 웹앱 — 상수 테이블
 *
 * 천간/지지/오행 매핑, 오호결원, 오서결원 등 핵심 데이터.
 * 이 파일이 모든 매핑의 단일 소스(Single Source of Truth)입니다.
 *
 * 참조: ARCHITECTURE.md, saju-engine-design.md
 */

import type { Stem, Branch, Element, YinYang, TenGod } from './types';

// ──────────────────────────────────────
// 천간 (10개)
// ──────────────────────────────────────

export const STEMS: readonly Stem[] = [
  '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계',
] as const;

/** 천간 → 오행 */
export const STEM_ELEMENT: Record<Stem, Element> = {
  '갑': '목', '을': '목',
  '병': '화', '정': '화',
  '무': '토', '기': '토',
  '경': '금', '신': '금',
  '임': '수', '계': '수',
};

/** 천간 → 음양 */
export const STEM_YINYANG: Record<Stem, YinYang> = {
  '갑': '양', '을': '음',
  '병': '양', '정': '음',
  '무': '양', '기': '음',
  '경': '양', '신': '음',
  '임': '양', '계': '음',
};

// ──────────────────────────────────────
// 지지 (12개)
// ──────────────────────────────────────

export const BRANCHES: readonly Branch[] = [
  '자', '축', '인', '묘', '진', '사',
  '오', '미', '신', '유', '술', '해',
] as const;

/** 지지 → 본기(本氣) 오행 (MVP: 본기만 사용) */
export const BRANCH_MAIN_ELEMENT: Record<Branch, Element> = {
  '자': '수', '축': '토', '인': '목', '묘': '목',
  '진': '토', '사': '화', '오': '화', '미': '토',
  '신': '금', '유': '금', '술': '토', '해': '수',
};

/** 지지 → 음양 */
export const BRANCH_YINYANG: Record<Branch, YinYang> = {
  '자': '양', '축': '음', '인': '양', '묘': '음',
  '진': '양', '사': '음', '오': '양', '미': '음',
  '신': '양', '유': '음', '술': '양', '해': '음',
};

// ──────────────────────────────────────
// 오행 (5개)
// ──────────────────────────────────────

/** 오행 순서 (고정: 목→화→토→금→수) */
export const ELEMENTS: readonly Element[] = ['목', '화', '토', '금', '수'] as const;

/** 상생 관계: A가 B를 생함 (A → B) */
export const ELEMENT_GENERATES: Record<Element, Element> = {
  '목': '화', // 목생화
  '화': '토', // 화생토
  '토': '금', // 토생금
  '금': '수', // 금생수
  '수': '목', // 수생목
};

/** 나를 생하는 오행 (생아, 生我) */
export const GENERATING_ELEMENT: Record<Element, Element> = {
  '목': '수', // 수생목
  '화': '목', // 목생화
  '토': '화', // 화생토
  '금': '토', // 토생금
  '수': '금', // 금생수
};

/** 상극 관계: A가 B를 극함 (A → B) */
export const ELEMENT_CONTROLS: Record<Element, Element> = {
  '목': '토', // 목극토
  '화': '금', // 화극금
  '토': '수', // 토극수
  '금': '목', // 금극목
  '수': '화', // 수극화
};

/** 나를 극하는 오행 (극아, 剋我) */
export const CONTROLLING_ELEMENT: Record<Element, Element> = {
  '목': '금', // 금극목
  '화': '수', // 수극화
  '토': '목', // 목극토
  '금': '화', // 화극금
  '수': '토', // 토극수
};

// ──────────────────────────────────────
// 오호결원 (五虎遁元): 년간 → 인월(1월) 시작 천간
// saju-engine-design.md 섹션 3-1
// ──────────────────────────────────────

export const MONTH_STEM_START: Record<Stem, Stem> = {
  '갑': '병', '기': '병', // 갑·기년 → 병인월
  '을': '무', '경': '무', // 을·경년 → 무인월
  '병': '경', '신': '경', // 병·신년 → 경인월
  '정': '임', '임': '임', // 정·임년 → 임인월
  '무': '갑', '계': '갑', // 무·계년 → 갑인월
};

// ──────────────────────────────────────
// 오서결원 (五鼠遁元): 일간 → 자시 시작 천간
// saju-engine-design.md 섹션 3-2
// ──────────────────────────────────────

export const HOUR_STEM_START: Record<Stem, Stem> = {
  '갑': '갑', '기': '갑', // 갑·기일 → 갑자시
  '을': '병', '경': '병', // 을·경일 → 병자시
  '병': '무', '신': '무', // 병·신일 → 무자시
  '정': '경', '임': '경', // 정·임일 → 경자시
  '무': '임', '계': '임', // 무·계일 → 임자시
};

// ──────────────────────────────────────
// 시진 (時辰) 매핑
// ──────────────────────────────────────

/** 시(hour, 0-23) → 지지 인덱스 (0=자, 1=축, ..., 11=해) */
export function hourToBranchIndex(hour: number): number {
  // 자시: 23~01, 축시: 01~03, ..., 해시: 21~23
  // 야자시 규칙: 23:00~23:59 → 당일 자시 (인덱스 0)
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2);
}

/** 시진 이름 목록 (UI 표시용) */
export const HOUR_LABELS: { branch: Branch; label: string; range: string }[] = [
  { branch: '자', label: '자시(子時)', range: '23:00~01:00' },
  { branch: '축', label: '축시(丑時)', range: '01:00~03:00' },
  { branch: '인', label: '인시(寅時)', range: '03:00~05:00' },
  { branch: '묘', label: '묘시(卯時)', range: '05:00~07:00' },
  { branch: '진', label: '진시(辰時)', range: '07:00~09:00' },
  { branch: '사', label: '사시(巳時)', range: '09:00~11:00' },
  { branch: '오', label: '오시(午時)', range: '11:00~13:00' },
  { branch: '미', label: '미시(未時)', range: '13:00~15:00' },
  { branch: '신', label: '신시(申時)', range: '15:00~17:00' },
  { branch: '유', label: '유시(酉時)', range: '17:00~19:00' },
  { branch: '술', label: '술시(戌時)', range: '19:00~21:00' },
  { branch: '해', label: '해시(亥時)', range: '21:00~23:00' },
];

// ──────────────────────────────────────
// 십성 관계 판정
// ──────────────────────────────────────

/**
 * 일간과 대상 글자의 십성을 구한다.
 *
 * 십성 판정 로직 (saju-engine-design.md 섹션 5):
 * - 비화(같은 오행): 같은 음양 → 비견, 다른 음양 → 겁재
 * - 아생(내가 생하는): 같은 음양 → 식신, 다른 음양 → 상관
 * - 아극(내가 극하는): 같은 음양 → 편재, 다른 음양 → 정재
 * - 극아(나를 극하는): 같은 음양 → 편관, 다른 음양 → 정관
 * - 생아(나를 생하는): 같은 음양 → 편인, 다른 음양 → 정인
 */
export function getTenGod(
  dayElement: Element,
  dayYinYang: YinYang,
  targetElement: Element,
  targetYinYang: YinYang,
): TenGod {
  const sameYinYang = dayYinYang === targetYinYang;

  if (targetElement === dayElement) {
    return sameYinYang ? '비견' : '겁재';
  }
  if (targetElement === ELEMENT_GENERATES[dayElement]) {
    return sameYinYang ? '식신' : '상관';
  }
  if (targetElement === ELEMENT_CONTROLS[dayElement]) {
    return sameYinYang ? '편재' : '정재';
  }
  if (targetElement === CONTROLLING_ELEMENT[dayElement]) {
    return sameYinYang ? '편관' : '정관';
  }
  // 생아: 나를 생하는 오행
  return sameYinYang ? '편인' : '정인';
}

// ──────────────────────────────────────
// 한자 매핑 (UI 표시용)
// ──────────────────────────────────────

export const STEM_HANJA: Record<Stem, string> = {
  '갑': '甲', '을': '乙', '병': '丙', '정': '丁', '무': '戊',
  '기': '己', '경': '庚', '신': '辛', '임': '壬', '계': '癸',
};

export const BRANCH_HANJA: Record<Branch, string> = {
  '자': '子', '축': '丑', '인': '寅', '묘': '卯', '진': '辰', '사': '巳',
  '오': '午', '미': '未', '신': '申', '유': '酉', '술': '戌', '해': '亥',
};

export const ELEMENT_HANJA: Record<Element, string> = {
  '목': '木', '화': '火', '토': '土', '금': '金', '수': '水',
};

// ──────────────────────────────────────
// 오행 색상 (UI 표시용, Tailwind 클래스)
// ──────────────────────────────────────

export const ELEMENT_COLORS: Record<Element, { bg: string; text: string; hex: string }> = {
  '목': { bg: 'bg-green-100', text: 'text-green-700', hex: '#22C55E' },
  '화': { bg: 'bg-red-100', text: 'text-red-700', hex: '#EF4444' },
  '토': { bg: 'bg-yellow-100', text: 'text-yellow-700', hex: '#EAB308' },
  '금': { bg: 'bg-slate-100', text: 'text-slate-600', hex: '#94A3B8' },
  '수': { bg: 'bg-blue-100', text: 'text-blue-700', hex: '#3B82F6' },
};
