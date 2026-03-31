/**
 * 대운(大運) / 세운(歲運) 계산 모듈 — 2단계
 *
 * lunar-javascript의 EightChar.getYun() API를 사용하여
 * 대운(10년 단위)과 세운(연도별) 운세 흐름을 산출한다.
 *
 * 대운 순행/역행 규칙:
 *   - 양년간 + 남성 = 순행 (甲丙戊庚壬년생 남자)
 *   - 양년간 + 여성 = 역행 (甲丙戊庚壬년생 여자)
 *   - 음년간 + 남성 = 역행 (乙丁己辛癸년생 남자)
 *   - 음년간 + 여성 = 순행 (乙丁己辛癸년생 여자)
 *
 * 참조: saju-engine-design.md 2단계
 */

import { Solar, Lunar } from 'lunar-javascript';
import type { BirthInput, DaeunResult, Daeun, Saeun, Pillar, Stem, Branch } from './types';

// ──────────────────────────────────────
// 한자 → 한글 변환 (calendar.ts와 동일)
// ──────────────────────────────────────

const HANJA_TO_STEM: Record<string, Stem> = {
  '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
  '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
};

const HANJA_TO_BRANCH: Record<string, Branch> = {
  '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사',
  '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해',
};

function parseGanZhi(ganZhi: string): Pillar {
  const stem = HANJA_TO_STEM[ganZhi[0]];
  const branch = HANJA_TO_BRANCH[ganZhi[1]];
  if (!stem || !branch) {
    throw new Error(`대운 간지 변환 실패: "${ganZhi}"`);
  }
  return { stem, branch };
}

// ──────────────────────────────────────
// 대운 계산 함수
// ──────────────────────────────────────

/**
 * 생년월일시와 성별을 기반으로 대운과 세운을 산출한다.
 *
 * @param input - 생년월일시 + 성별
 * @returns 대운 계산 결과 (순행/역행, 시작 나이, 8개 대운 + 각 대운의 세운)
 */
export function calculateDaeun(input: BirthInput): DaeunResult {
  const { year, month, day, hour, minute, isLunar, isLeapMonth, gender } = input;

  // 1. Solar 객체 생성 (calendar.ts와 동일 로직)
  let solar: InstanceType<typeof Solar>;

  if (isLunar) {
    const lunar = Lunar.fromYmdHms(year, month, day, hour ?? 12, minute, 0);
    if (isLeapMonth) {
      const lunarLeap = Lunar.fromYmdHms(year, -month, day, hour ?? 12, minute, 0);
      solar = lunarLeap.getSolar();
    } else {
      solar = lunar.getSolar();
    }
  } else {
    solar = Solar.fromYmdHms(year, month, day, hour ?? 12, minute, 0);
  }

  // 2. 대운 산출 (lunar-javascript 내장 API)
  //    gender: 1 = 남성(M), 0 = 여성(F)
  //    sect: 1 = 일차법(日差法, 3일=1년)
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  const genderCode = gender === 'M' ? 1 : 0;
  const yun = eightChar.getYun(genderCode, 1);

  // 3. 대운 목록 추출 (소운 index=0 제외, 대운 index=1~8)
  const daYunList = yun.getDaYun(9); // 소운(0) + 대운 8개
  const daeuns: Daeun[] = [];

  for (const daYun of daYunList) {
    if (daYun.getIndex() < 1) continue; // 소운 제외

    const ganZhi = daYun.getGanZhi();
    let pillar: Pillar;
    try {
      pillar = parseGanZhi(ganZhi);
    } catch {
      continue; // 변환 실패 시 스킵
    }

    // 세운 (이 대운 기간의 10년)
    const liuNians = daYun.getLiuNian(10);
    const saeuns: Saeun[] = liuNians
      .map((ln) => {
        const lnGanZhi = ln.getGanZhi();
        try {
          return {
            year: ln.year,
            age: ln.age,
            pillar: parseGanZhi(lnGanZhi),
            ganZhi: lnGanZhi,
          } as Saeun;
        } catch {
          return null;
        }
      })
      .filter((s): s is Saeun => s !== null);

    daeuns.push({
      index: daYun.getIndex(),
      pillar,
      ganZhi,
      startAge: daYun.getStartAge(),
      endAge: daYun.getEndAge(),
      startYear: daYun.getStartYear(),
      endYear: daYun.getEndYear(),
      saeuns,
    });
  }

  return {
    isForward: yun.isForward(),
    startYears: yun.getStartYear(),
    startMonths: yun.getStartMonth(),
    startDays: yun.getStartDay(),
    daeuns,
  };
}
