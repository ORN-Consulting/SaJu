import { describe, it, expect } from 'vitest';
import { analyzeFiveElements } from '@/lib/saju/five-elements';
import type { SajuPillars } from '@/lib/saju/types';

describe('analyzeFiveElements', () => {
  it('CASE-001 사주의 오행 분포를 카운팅한다', () => {
    // 경오년 기묘월 기묘일 경오시
    const pillars: SajuPillars = {
      year:  { stem: '경', branch: '오' },
      month: { stem: '기', branch: '묘' },
      day:   { stem: '기', branch: '묘' },
      hour:  { stem: '경', branch: '오' },
    };
    const result = analyzeFiveElements(pillars, true);

    // 천간: 경(금), 기(토), 기(토), 경(금) = 금2 토2
    // 지지본기: 오(화), 묘(목), 묘(목), 오(화) = 화2 목2
    expect(result.distribution).toEqual({ '목': 2, '화': 2, '토': 2, '금': 2, '수': 0 });
    expect(result.weak).toBe('수');
    expect(result.balance).toBe('imbalanced');
  });

  it('3주 분석 시 6글자로 카운팅한다', () => {
    const pillars: SajuPillars = {
      year:  { stem: '을', branch: '해' },
      month: { stem: '임', branch: '오' },
      day:   { stem: '정', branch: '축' },
      hour:  null,
    };
    const result = analyzeFiveElements(pillars, false);

    // 천간: 을(목), 임(수), 정(화) = 목1 수1 화1
    // 지지본기: 해(수), 오(화), 축(토) = 수1 화1 토1
    expect(result.distribution).toEqual({ '목': 1, '화': 2, '토': 1, '금': 0, '수': 2 });
  });

  it('균형 판정: maxCount - minCount <= 1이면 balanced', () => {
    const pillars: SajuPillars = {
      year:  { stem: '갑', branch: '자' },
      month: { stem: '병', branch: '인' },
      day:   { stem: '무', branch: '신' },
      hour:  { stem: '경', branch: '오' },
    };
    const result = analyzeFiveElements(pillars, true);
    // 천간: 갑(목), 병(화), 무(토), 경(금) = 각1
    // 지지: 자(수), 인(목), 신(금), 오(화) = 수1 목1 금1 화1
    // 총: 목2 화2 토1 금2 수1 → max=2, min=1, diff=1 → balanced
    expect(result.balance).toBe('balanced');
  });

  it('동점 시 dominant는 상생 순서 앞쪽', () => {
    const pillars: SajuPillars = {
      year:  { stem: '갑', branch: '사' },
      month: { stem: '병', branch: '인' },
      day:   { stem: '갑', branch: '사' },
      hour:  { stem: '병', branch: '인' },
    };
    const result = analyzeFiveElements(pillars, true);
    // 목4 화4 → 동점. 상생 순서에서 목이 앞
    expect(result.dominant).toBe('목');
  });
});
