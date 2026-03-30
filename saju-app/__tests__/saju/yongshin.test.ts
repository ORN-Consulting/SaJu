import { describe, it, expect } from 'vitest';
import { determineYongshin } from '@/lib/saju/yongshin';
import { analyzeFiveElements } from '@/lib/saju/five-elements';
import type { SajuPillars } from '@/lib/saju/types';

describe('determineYongshin', () => {
  it('신강 사주: 용신이 억제 오행이다', () => {
    // 기토 일간, 토가 강한 사주
    const pillars: SajuPillars = {
      year:  { stem: '무', branch: '술' },
      month: { stem: '기', branch: '미' },
      day:   { stem: '기', branch: '축' },
      hour:  { stem: '무', branch: '진' },
    };
    const fe = analyzeFiveElements(pillars, true);
    const result = determineYongshin('기', pillars, fe, true);

    expect(result.dayStrength).toBe('신강');
    // 토가 강하면 억제 필요: 아극(토→수) or 극아(목→토)
    expect(['수', '목']).toContain(result.yongshin);
  });

  it('신약 사주: 용신이 부조 오행이다', () => {
    // 기토 일간, 토가 약한 사주
    const pillars: SajuPillars = {
      year:  { stem: '갑', branch: '인' },
      month: { stem: '임', branch: '자' },
      day:   { stem: '기', branch: '해' },
      hour:  { stem: '계', branch: '묘' },
    };
    const fe = analyzeFiveElements(pillars, true);
    const result = determineYongshin('기', pillars, fe, true);

    expect(result.dayStrength).toBe('신약');
    // 토가 약하면 부조 필요: 생아(화→토) or 비화(토)
    expect(['화', '토']).toContain(result.yongshin);
  });

  it('희신과 기신이 올바르게 산출된다', () => {
    const pillars: SajuPillars = {
      year:  { stem: '무', branch: '술' },
      month: { stem: '기', branch: '미' },
      day:   { stem: '기', branch: '축' },
      hour:  { stem: '무', branch: '진' },
    };
    const fe = analyzeFiveElements(pillars, true);
    const result = determineYongshin('기', pillars, fe, true);

    // 희신 = 용신을 생하는 오행
    // 기신 = 용신을 극하는 오행
    expect(result.heeshin).toBeDefined();
    expect(result.gishin).toBeDefined();
    expect(result.heeshin).not.toBe(result.yongshin);
    expect(result.gishin).not.toBe(result.yongshin);
  });

  it('details에 득령/득지/득세 정보가 있다', () => {
    const pillars: SajuPillars = {
      year:  { stem: '갑', branch: '인' },
      month: { stem: '을', branch: '묘' },
      day:   { stem: '갑', branch: '인' },
      hour:  { stem: '병', branch: '오' },
    };
    const fe = analyzeFiveElements(pillars, true);
    const result = determineYongshin('갑', pillars, fe, true);

    expect(result.details).toHaveProperty('deukryeong');
    expect(result.details).toHaveProperty('deukji');
    expect(result.details).toHaveProperty('deukse');
    expect(result.details.score).toBeGreaterThanOrEqual(0);
    expect(result.details.score).toBeLessThanOrEqual(3);
  });

  it('3주 분석에서도 용신을 판단할 수 있다', () => {
    const pillars: SajuPillars = {
      year:  { stem: '을', branch: '해' },
      month: { stem: '임', branch: '오' },
      day:   { stem: '정', branch: '축' },
      hour:  null,
    };
    const fe = analyzeFiveElements(pillars, false);
    const result = determineYongshin('정', pillars, fe, false);

    expect(result.dayStrength).toBeDefined();
    expect(result.yongshin).toBeDefined();
  });
});
