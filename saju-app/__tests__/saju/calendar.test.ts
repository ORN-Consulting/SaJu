/**
 * 만세력 계산 모듈 테스트
 *
 * lunar-javascript 라이브러리 출력을 기준으로 검증한다.
 */

import { describe, it, expect } from 'vitest';
import { calculatePillars } from '@/lib/saju/calendar';
import type { BirthInput } from '@/lib/saju/types';

function makeInput(overrides: Partial<BirthInput>): BirthInput {
  return {
    year: 1990, month: 3, day: 15,
    hour: 12, minute: 0,
    isLunar: false, isLeapMonth: false, gender: 'M',
    ...overrides,
  };
}

describe('calculatePillars', () => {
  it('CASE-001: 1990/3/15 오시 — 기본 양력 변환', () => {
    const result = calculatePillars(makeInput({}));
    expect(result.year).toEqual({ stem: '경', branch: '오' });
    expect(result.month).toEqual({ stem: '기', branch: '묘' });
    expect(result.day).toEqual({ stem: '기', branch: '묘' });
    expect(result.hour).toEqual({ stem: '경', branch: '오' });
  });

  it('CASE-002: 2000/1/20 자시 — 입춘 이전 (전년도 년주)', () => {
    const result = calculatePillars(makeInput({
      year: 2000, month: 1, day: 20, hour: 0, minute: 30, gender: 'F',
    }));
    // 입춘 전이므로 기묘년(1999)
    expect(result.year.stem).toBe('기');
    expect(result.year.branch).toBe('묘');
    expect(result.month).toEqual({ stem: '정', branch: '축' });
  });

  it('CASE-003: 1985/7/7 사시 — 여름 사주', () => {
    const result = calculatePillars(makeInput({
      year: 1985, month: 7, day: 7, hour: 10, minute: 0,
    }));
    expect(result.year).toEqual({ stem: '을', branch: '축' });
    expect(result.month).toEqual({ stem: '임', branch: '오' });
    expect(result.day).toEqual({ stem: '정', branch: '미' });
    expect(result.hour).toEqual({ stem: '을', branch: '사' });
  });

  it('CASE-004: 1975/12/31 해시 — 연말', () => {
    const result = calculatePillars(makeInput({
      year: 1975, month: 12, day: 31, hour: 22, minute: 0, gender: 'F',
    }));
    expect(result.year).toEqual({ stem: '을', branch: '묘' });
    expect(result.month).toEqual({ stem: '무', branch: '자' });
    expect(result.day).toEqual({ stem: '신', branch: '해' });
    expect(result.hour).toEqual({ stem: '기', branch: '해' });
  });

  it('CASE-005: 생시 모름 — 시주 null', () => {
    const result = calculatePillars(makeInput({
      year: 1995, month: 6, day: 15, hour: null,
    }));
    expect(result.year).toEqual({ stem: '을', branch: '해' });
    expect(result.month).toEqual({ stem: '임', branch: '오' });
    expect(result.day).toEqual({ stem: '정', branch: '축' });
    expect(result.hour).toBeNull();
  });

  it('CASE-007: 1992/11/15 23:30 — 야자시 (당일 자시)', () => {
    const result = calculatePillars(makeInput({
      year: 1992, month: 11, day: 15, hour: 23, minute: 30,
    }));
    // 야자시: 당일의 일주를 유지
    expect(result.day).toEqual({ stem: '을', branch: '미' });
    expect(result.hour?.branch).toBe('자');
  });

  it('야자시 경계: 23:00 vs 22:59', () => {
    const at2259 = calculatePillars(makeInput({
      year: 1992, month: 11, day: 15, hour: 22, minute: 59,
    }));
    const at2300 = calculatePillars(makeInput({
      year: 1992, month: 11, day: 15, hour: 23, minute: 0,
    }));

    // 22:59 = 해시, 23:00 = 자시
    expect(at2259.hour?.branch).toBe('해');
    expect(at2300.hour?.branch).toBe('자');
    // 둘 다 같은 날의 일주
    expect(at2259.day).toEqual(at2300.day);
  });

  it('4개 기둥이 모두 존재 (시주 포함)', () => {
    const result = calculatePillars(makeInput({}));
    expect(result.year).toBeDefined();
    expect(result.month).toBeDefined();
    expect(result.day).toBeDefined();
    expect(result.hour).toBeDefined();
    expect(result.hour).not.toBeNull();
  });
});
