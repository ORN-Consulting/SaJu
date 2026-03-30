/**
 * 만세력 계산 모듈
 *
 * 양력 생년월일시를 사주팔자(四柱八字)로 변환한다.
 * lunar-javascript 라이브러리를 사용하며, 절기 기준으로 년주와 월주를 산정한다.
 * 야자시(23:00~00:00)는 당일로 처리한다 (라이브러리 기본 동작과 일치).
 *
 * 참조: ARCHITECTURE.md 섹션 4.1, saju-engine-design.md
 */

import { Solar, Lunar } from 'lunar-javascript';
import type { BirthInput, SajuPillars, Pillar, Stem, Branch } from './types';

// ──────────────────────────────────────
// 한자 → 한글 변환 테이블
// ──────────────────────────────────────

const HANJA_TO_STEM: Record<string, Stem> = {
  '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
  '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
};

const HANJA_TO_BRANCH: Record<string, Branch> = {
  '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사',
  '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해',
};

/**
 * 한자 간지 문자열에서 천간과 지지를 추출하여 한글로 변환한다.
 *
 * @param ganZhi - 2글자 한자 간지 (예: "庚午")
 * @returns Pillar - 천간·지지 한글 객체
 */
function parseGanZhi(ganZhi: string): Pillar {
  const stemHanja = ganZhi[0];
  const branchHanja = ganZhi[1];

  const stem = HANJA_TO_STEM[stemHanja];
  const branch = HANJA_TO_BRANCH[branchHanja];

  if (!stem || !branch) {
    throw new Error(`간지 변환 실패: "${ganZhi}" (stem=${stemHanja}, branch=${branchHanja})`);
  }

  return { stem, branch };
}

/**
 * 양력 생년월일시를 사주팔자(四柱八字)로 변환한다.
 *
 * 절기 기준으로 년주와 월주를 산정하며,
 * 야자시(23:00~00:00)는 당일로 처리한다.
 *
 * @param input - 생년월일시 및 성별 정보
 * @returns 사주 네 기둥 (년주, 월주, 일주, 시주). 생시 모름 시 시주는 null.
 * @throws {Error} 유효하지 않은 날짜이거나 라이브러리 계산 실패 시
 *
 * @example
 * const pillars = calculatePillars({
 *   year: 1990, month: 3, day: 15,
 *   hour: 12, minute: 0,
 *   isLunar: false, isLeapMonth: false, gender: 'M'
 * });
 */
export function calculatePillars(input: BirthInput): SajuPillars {
  const { year, month, day, hour, minute, isLunar, isLeapMonth } = input;

  // 1. Solar 객체 생성
  let solar: InstanceType<typeof Solar>;

  if (isLunar) {
    // 음력 → 양력 변환 후 Solar 생성
    const lunar = Lunar.fromYmdHms(
      year, month, day,
      hour ?? 12, minute, 0
    );
    // 윤달 처리: lunar-javascript는 Lunar.fromYmd에서 윤달 자동 판정
    // isLeapMonth가 true이면 해당 월의 윤달로 지정
    if (isLeapMonth) {
      // lunar-javascript의 윤달 처리를 위해 별도 API 사용
      const lunarLeap = Lunar.fromYmdHms(year, -month, day, hour ?? 12, minute, 0);
      solar = lunarLeap.getSolar();
    } else {
      solar = lunar.getSolar();
    }
  } else {
    // 양력 직접 사용
    solar = Solar.fromYmdHms(year, month, day, hour ?? 12, minute, 0);
  }

  // 2. 팔자(EightChar) 산출 — 절기 기준 자동 적용
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // 3. 간지 추출 및 한글 변환
  const yearPillar = parseGanZhi(eightChar.getYear());
  const monthPillar = parseGanZhi(eightChar.getMonth());
  const dayPillar = parseGanZhi(eightChar.getDay());

  // 4. 시주 처리
  let hourPillar: Pillar | null = null;
  if (hour !== null) {
    hourPillar = parseGanZhi(eightChar.getTime());
  }

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  };
}
