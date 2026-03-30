import { describe, it, expect } from 'vitest';
import { analyzeSaju } from '@/lib/saju/index';
import type { BirthInput, SajuAnalysisResult } from '@/lib/saju/types';

function makeInput(overrides: Partial<BirthInput>): BirthInput {
  return {
    year: 1990, month: 3, day: 15,
    hour: 12, minute: 0,
    isLunar: false, isLeapMonth: false, gender: 'M',
    ...overrides,
  };
}

describe('analyzeSaju (통합)', () => {
  it('정상 입력 시 success: true를 반환한다', () => {
    const result = analyzeSaju(makeInput({}));
    expect(result.success).toBe(true);
  });

  it('모든 결과 필드가 존재한다', () => {
    const result = analyzeSaju(makeInput({}));
    if (!result.success) throw new Error('Expected success');

    expect(result.pillars).toBeDefined();
    expect(result.fiveElements).toBeDefined();
    expect(result.tenGods).toBeDefined();
    expect(result.yongshin).toBeDefined();
    expect(result.interpretation).toBeDefined();
    expect(result.hasHour).toBe(true);
  });

  it('생시 모름 시 hasHour=false, 시주=null', () => {
    const result = analyzeSaju(makeInput({ hour: null }));
    if (!result.success) throw new Error('Expected success');

    expect(result.hasHour).toBe(false);
    expect(result.pillars.hour).toBeNull();
    expect(result.tenGods.hourStem).toBeNull();
    expect(result.tenGods.hourBranch).toBeNull();
  });

  it('해석 텍스트가 빈 문자열이 아니다', () => {
    const result = analyzeSaju(makeInput({}));
    if (!result.success) throw new Error('Expected success');

    expect(result.interpretation.dayStemNature.length).toBeGreaterThan(0);
    expect(result.interpretation.fiveElementsSummary.length).toBeGreaterThan(0);
    expect(result.interpretation.tenGodsSummary.length).toBeGreaterThan(0);
    expect(result.interpretation.yongshinMeaning.length).toBeGreaterThan(0);
    expect(result.interpretation.comprehensiveReading.length).toBeGreaterThan(0);
  });

  it('여러 케이스에서 에러 없이 실행된다', () => {
    const cases = [
      makeInput({ year: 1985, month: 7, day: 7, hour: 10 }),
      makeInput({ year: 1975, month: 12, day: 31, hour: 22, gender: 'F' }),
      makeInput({ year: 2000, month: 1, day: 20, hour: 0, minute: 30, gender: 'F' }),
      makeInput({ year: 1992, month: 11, day: 15, hour: 23, minute: 30 }),
      makeInput({ year: 1995, month: 6, day: 15, hour: null }),
    ];

    for (const input of cases) {
      const result = analyzeSaju(input);
      expect(result.success).toBe(true);
    }
  });

  it('오행 분포의 합이 총 글자 수와 일치한다', () => {
    const result = analyzeSaju(makeInput({})) as SajuAnalysisResult;
    const total = Object.values(result.fiveElements.distribution).reduce((a, b) => a + b, 0);
    expect(total).toBe(8); // 4주 = 8글자

    const result3 = analyzeSaju(makeInput({ hour: null })) as SajuAnalysisResult;
    const total3 = Object.values(result3.fiveElements.distribution).reduce((a, b) => a + b, 0);
    expect(total3).toBe(6); // 3주 = 6글자
  });
});
