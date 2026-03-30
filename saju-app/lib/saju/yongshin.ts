/**
 * 용신 판단 모듈
 *
 * 사주의 균형을 맞추기 위해 필요한 오행(용신)을 판단한다.
 * MVP에서는 억부법(抑扶法) 기본 로직만 구현한다.
 *
 * 참조: saju-engine-design.md 섹션 3
 */

import type {
  Stem, SajuPillars, FiveElementsResult, YongshinResult, Element,
} from './types';
import {
  STEM_ELEMENT, BRANCH_MAIN_ELEMENT,
  GENERATING_ELEMENT, CONTROLLING_ELEMENT,
  ELEMENT_CONTROLS,
} from './constants';

/**
 * 두 오행 후보 중 사주에 더 부족한(카운트가 작은) 것을 선택한다.
 * 동점이면 first를 우선한다.
 */
function selectWeaker(
  first: Element,
  second: Element,
  fiveElements: FiveElementsResult,
): Element {
  return fiveElements.distribution[first] <= fiveElements.distribution[second]
    ? first
    : second;
}

/**
 * 용신(用神)을 판단한다.
 *
 * 억부법 기본:
 * 1. 일간의 강약 판단 (득령·득지·득세)
 * 2. 신강이면 → 일간을 억제하는 오행이 용신
 * 3. 신약이면 → 일간을 돕는 오행이 용신
 *
 * @param dayStem - 일간
 * @param pillars - 사주팔자
 * @param fiveElements - 오행 분포 결과
 * @param hasHour - 시주 포함 여부
 * @returns 용신 판단 결과
 */
export function determineYongshin(
  dayStem: Stem,
  pillars: SajuPillars,
  fiveElements: FiveElementsResult,
  hasHour: boolean,
): YongshinResult {
  const dayElement = STEM_ELEMENT[dayStem];
  const generating = GENERATING_ELEMENT[dayElement]; // 나를 생하는 오행

  // ── 득령 (得令) ──
  // 월지의 본기 오행이 일간과 같은 오행(비화)이거나 나를 생하는 오행(생아)인가?
  const monthBranchElement = BRANCH_MAIN_ELEMENT[pillars.month.branch];
  const deukryeong = (monthBranchElement === dayElement)
    || (monthBranchElement === generating);

  // ── 득지 (得地) ──
  // 지지 중 본기 오행이 일간과 같은 오행(비화)인 것이 2개 이상인가?
  const branches = hasHour && pillars.hour
    ? [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch]
    : [pillars.year.branch, pillars.month.branch, pillars.day.branch];
  const sameElementCount = branches
    .filter(b => BRANCH_MAIN_ELEMENT[b] === dayElement).length;
  const deukji = sameElementCount >= 2;

  // ── 득세 (得勢) ──
  // 일간 외 천간 중 일간을 돕는 오행(비화 또는 생아)이 1개 이상인가?
  const otherStems = hasHour && pillars.hour
    ? [pillars.year.stem, pillars.month.stem, pillars.hour.stem]
    : [pillars.year.stem, pillars.month.stem];
  const deukse = otherStems.some(s =>
    STEM_ELEMENT[s] === dayElement || STEM_ELEMENT[s] === generating
  );

  // ── 신강/신약 판정 ──
  const score = (deukryeong ? 1 : 0) + (deukji ? 1 : 0) + (deukse ? 1 : 0);
  const isStrong = score >= 2;

  // ── 용신 결정 ──
  // 신강 → 억제 (아극 1순위, 극아 2순위 중 부족한 것)
  // 신약 → 부조 (생아 1순위, 비화 2순위 중 부족한 것)
  const yongshin = isStrong
    ? selectWeaker(ELEMENT_CONTROLS[dayElement], CONTROLLING_ELEMENT[dayElement], fiveElements)
    : selectWeaker(generating, dayElement, fiveElements);

  // ── 희신/기신 ──
  const heeshin = GENERATING_ELEMENT[yongshin]; // 용신을 생하는 오행
  const gishin = CONTROLLING_ELEMENT[yongshin]; // 용신을 극하는 오행

  return {
    dayStrength: isStrong ? '신강' : '신약',
    yongshin,
    heeshin,
    gishin,
    details: { deukryeong, deukji, deukse, score },
  };
}
