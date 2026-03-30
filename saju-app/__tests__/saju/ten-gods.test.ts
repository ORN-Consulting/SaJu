import { describe, it, expect } from 'vitest';
import { calculateTenGods } from '@/lib/saju/ten-gods';
import type { SajuPillars } from '@/lib/saju/types';

describe('calculateTenGods', () => {
  it('일간 기준 십성을 산출한다 (기토 일간)', () => {
    // 경오년 기묘월 기묘일 경오시
    const pillars: SajuPillars = {
      year:  { stem: '경', branch: '오' },
      month: { stem: '기', branch: '묘' },
      day:   { stem: '기', branch: '묘' },
      hour:  { stem: '경', branch: '오' },
    };
    const result = calculateTenGods('기', pillars, true);

    // 기(토, 음) 일간 기준:
    // 경(금, 양) → 토생금, 다른 음양 → 상관
    expect(result.yearStem).toBe('상관');
    // 오(화, 양) → 화생토, 다른 음양 → 정인
    expect(result.yearBranch).toBe('정인');
    // 기(토, 음) → 같은 오행 같은 음양 → 비견
    expect(result.monthStem).toBe('비견');
    // 묘(목, 음) → 목극토, 같은 음양(기=음, 묘=음) → 편관
    expect(result.monthBranch).toBe('편관');
    // 일간 자신은 null
    expect(result.dayStem).toBeNull();

    expect(result.hourStem).toBe('상관');
    expect(result.hourBranch).toBe('정인');
  });

  it('3주 분석 시 시주 십성은 null', () => {
    const pillars: SajuPillars = {
      year:  { stem: '을', branch: '해' },
      month: { stem: '임', branch: '오' },
      day:   { stem: '정', branch: '축' },
      hour:  null,
    };
    const result = calculateTenGods('정', pillars, false);

    expect(result.hourStem).toBeNull();
    expect(result.hourBranch).toBeNull();
  });

  it('십성 카운트가 정확하다', () => {
    const pillars: SajuPillars = {
      year:  { stem: '경', branch: '오' },
      month: { stem: '기', branch: '묘' },
      day:   { stem: '기', branch: '묘' },
      hour:  { stem: '경', branch: '오' },
    };
    const result = calculateTenGods('기', pillars, true);

    // 상관 2개, 정인 2개, 비견 1개, 편관 2개
    expect(result.counts['상관']).toBe(2);
    expect(result.counts['정인']).toBe(2);
    expect(result.counts['편관']).toBe(2);
    expect(result.counts['비견']).toBe(1);
  });
});
