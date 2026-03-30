/**
 * 오행 분석 모듈
 *
 * 사주팔자에서 오행(木火土金水) 분포를 분석한다.
 * MVP에서는 8글자(천간 4 + 지지 본기 4)의 단순 카운팅을 사용한다.
 *
 * 참조: saju-engine-design.md 섹션 5-1
 */

import type { SajuPillars, FiveElementsResult, Element } from './types';
import { STEM_ELEMENT, BRANCH_MAIN_ELEMENT, ELEMENTS } from './constants';

/**
 * 사주팔자의 오행 분포를 분석한다.
 *
 * 8글자(천간 4 + 지지 본기 4)의 오행을 단순 카운팅한다.
 * 3주 분석 시 6글자로 카운팅한다.
 *
 * @param pillars - 사주팔자
 * @param hasHour - 시주 포함 여부
 * @returns 오행 분포 분석 결과
 */
export function analyzeFiveElements(
  pillars: SajuPillars,
  hasHour: boolean,
): FiveElementsResult {
  const counts: Record<Element, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };

  // 천간 카운팅
  counts[STEM_ELEMENT[pillars.year.stem]]++;
  counts[STEM_ELEMENT[pillars.month.stem]]++;
  counts[STEM_ELEMENT[pillars.day.stem]]++;
  if (hasHour && pillars.hour) {
    counts[STEM_ELEMENT[pillars.hour.stem]]++;
  }

  // 지지 본기 카운팅
  counts[BRANCH_MAIN_ELEMENT[pillars.year.branch]]++;
  counts[BRANCH_MAIN_ELEMENT[pillars.month.branch]]++;
  counts[BRANCH_MAIN_ELEMENT[pillars.day.branch]]++;
  if (hasHour && pillars.hour) {
    counts[BRANCH_MAIN_ELEMENT[pillars.hour.branch]]++;
  }

  // 최대/최소 찾기 (동점 시 상생 순서 적용)
  const maxCount = Math.max(...ELEMENTS.map(e => counts[e]));
  const minCount = Math.min(...ELEMENTS.map(e => counts[e]));

  // 동점 시 상생 순서(목→화→토→금→수)에서 앞선 것 = dominant
  const dominant = ELEMENTS.find(e => counts[e] === maxCount)!;
  // 동점 시 상생 순서에서 뒤선 것 = weak
  const weak = [...ELEMENTS].reverse().find(e => counts[e] === minCount)!;

  // 균형 판정: maxCount - minCount <= 1 → balanced
  const balance = (maxCount - minCount <= 1) ? 'balanced' : 'imbalanced';

  return {
    distribution: counts,
    dominant,
    weak,
    balance,
  };
}
