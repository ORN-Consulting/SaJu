/**
 * 신살(神煞) 분석 모듈 — 3단계
 *
 * 일지·년지를 기준으로 역마(驛馬), 도화(桃花), 화개(華蓋)를 판정한다.
 * 삼합 그룹을 기준으로 대상 지지를 구하고,
 * 나머지 기둥에 해당 지지가 존재하면 신살 발견으로 판정한다.
 */

import type { SajuPillars, SinsalResult, SinsalEntry, SinsalType, Branch } from './types';
import { SINSAL_TABLE } from './constants';

const SINSAL_TYPES: SinsalType[] = ['역마', '도화', '화개'];

type PillarPosition = '년지' | '월지' | '일지' | '시지';

/**
 * 사주팔자의 신살을 분석한다.
 *
 * @param pillars - 사주 4주 (시주 null 가능)
 * @param hasHour - 시주 존재 여부
 * @returns 전체 신살 분석 결과
 */
export function analyzeSinsal(pillars: SajuPillars, hasHour: boolean): SinsalResult {
  const entries: SinsalEntry[] = [];

  // 기준: 일지와 년지 모두 사용
  const bases: { branch: Branch; label: '일지' | '년지' }[] = [
    { branch: pillars.day.branch, label: '일지' },
    { branch: pillars.year.branch, label: '년지' },
  ];

  // 모든 기둥의 지지 목록 (위치 포함)
  const allBranches: { branch: Branch; position: PillarPosition }[] = [
    { branch: pillars.year.branch, position: '년지' },
    { branch: pillars.month.branch, position: '월지' },
    { branch: pillars.day.branch, position: '일지' },
  ];
  if (hasHour && pillars.hour) {
    allBranches.push({ branch: pillars.hour.branch, position: '시지' });
  }

  for (const basis of bases) {
    for (const type of SINSAL_TYPES) {
      const targetBranch = SINSAL_TABLE[type][basis.branch];

      // 기준 지지 자체는 검색 대상에서 제외, 나머지에서 target 탐색
      const foundIn = allBranches
        .filter((b) => b.position !== basis.label && b.branch === targetBranch)
        .map((b) => b.position);

      entries.push({
        type,
        targetBranch,
        basisBranch: basis.branch,
        basisLabel: basis.label,
        found: foundIn.length > 0,
        foundIn,
      });
    }
  }

  const detected = entries.filter((e) => e.found);

  return { entries, detected };
}
