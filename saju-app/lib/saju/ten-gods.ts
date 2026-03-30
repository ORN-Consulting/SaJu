/**
 * 십성 산출 모듈
 *
 * 일간(日干)을 기준으로 나머지 7글자의 십성(十星)을 산출한다.
 * 지지는 본기(本氣)의 오행으로 십성을 산출한다.
 *
 * 참조: saju-engine-design.md 섹션 5, AGENTS.md 4.2
 */

import type { SajuPillars, TenGodsResult, Stem, TenGod } from './types';
import {
  STEM_ELEMENT, STEM_YINYANG,
  BRANCH_MAIN_ELEMENT, BRANCH_YINYANG,
  getTenGod,
} from './constants';

/**
 * 십성(十星)을 산출한다.
 *
 * 십성이란 일간(日干, 나)을 기준으로 다른 천간·지지와의 관계를 나타내는 것이다.
 * - 비화(比和): 같은 오행 → 비견(같은 음양), 겁재(다른 음양)
 * - 아생(我生): 내가 생하는 오행 → 식신(같은 음양), 상관(다른 음양)
 * - 아극(我剋): 내가 극하는 오행 → 편재(같은 음양), 정재(다른 음양)
 * - 극아(剋我): 나를 극하는 오행 → 편관(같은 음양), 정관(다른 음양)
 * - 생아(生我): 나를 생하는 오행 → 편인(같은 음양), 정인(다른 음양)
 *
 * @param dayStem - 일간 (나)
 * @param pillars - 사주팔자
 * @param hasHour - 시주 포함 여부
 * @returns 십성 산출 결과
 */
export function calculateTenGods(
  dayStem: Stem,
  pillars: SajuPillars,
  hasHour: boolean,
): TenGodsResult {
  const dayElement = STEM_ELEMENT[dayStem];
  const dayYinYang = STEM_YINYANG[dayStem];

  // 각 위치의 십성 산출
  function stemTenGod(stem: Stem): TenGod {
    return getTenGod(dayElement, dayYinYang, STEM_ELEMENT[stem], STEM_YINYANG[stem]);
  }

  function branchTenGod(branch: typeof pillars.year.branch): TenGod {
    return getTenGod(dayElement, dayYinYang, BRANCH_MAIN_ELEMENT[branch], BRANCH_YINYANG[branch]);
  }

  const yearStem = stemTenGod(pillars.year.stem);
  const yearBranch = branchTenGod(pillars.year.branch);
  const monthStem = stemTenGod(pillars.month.stem);
  const monthBranch = branchTenGod(pillars.month.branch);
  const dayBranch = branchTenGod(pillars.day.branch);

  const hourStem = (hasHour && pillars.hour) ? stemTenGod(pillars.hour.stem) : null;
  const hourBranch = (hasHour && pillars.hour) ? branchTenGod(pillars.hour.branch) : null;

  // 십성별 등장 횟수
  const allGods: TenGod[] = [yearStem, yearBranch, monthStem, monthBranch, dayBranch];
  if (hourStem) allGods.push(hourStem);
  if (hourBranch) allGods.push(hourBranch);

  const counts: Partial<Record<TenGod, number>> = {};
  for (const god of allGods) {
    counts[god] = (counts[god] ?? 0) + 1;
  }

  // 가장 많이 등장하는 십성
  let dominant: TenGod = allGods[0];
  let maxCount = 0;
  for (const [god, count] of Object.entries(counts) as [TenGod, number][]) {
    if (count > maxCount) {
      maxCount = count;
      dominant = god;
    }
  }

  return {
    yearStem,
    yearBranch,
    monthStem,
    monthBranch,
    dayStem: null,
    dayBranch,
    hourStem,
    hourBranch,
    counts,
    dominant,
  };
}
