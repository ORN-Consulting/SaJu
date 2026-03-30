/**
 * 사주 분석 통합 함수
 *
 * UI 컴포넌트가 호출하는 유일한 진입점.
 * 내부에서 calendar → five-elements → ten-gods → yongshin 순서로 파이프라인 실행.
 *
 * 참조: ARCHITECTURE.md 섹션 6-1
 */

import type {
  BirthInput,
  SajuAnalysisResponse,
  InterpretationResult,
  SajuPillars,
  FiveElementsResult,
  TenGodsResult,
  YongshinResult,
  Element,
  TenGod,
} from './types';
import { calculatePillars } from './calendar';
import { analyzeFiveElements } from './five-elements';
import { calculateTenGods } from './ten-gods';
import { determineYongshin } from './yongshin';
import { STEM_ELEMENT, ELEMENT_HANJA } from './constants';
import { ERROR_MESSAGES, FALLBACK_MESSAGES } from '../errors';

import dayStemsData from '@/data/interpretations/day-stems.json';
import tenGodsData from '@/data/interpretations/ten-gods.json';
import yongshinData from '@/data/interpretations/yongshin.json';
import fiveElementsData from '@/data/interpretations/five-elements.json';

/**
 * 사주 분석을 수행한다.
 *
 * @param input - 생년월일시 + 성별
 * @returns 분석 결과 또는 에러
 */
export function analyzeSaju(input: BirthInput): SajuAnalysisResponse {
  try {
    const hasHour = input.hour !== null;
    const pillars = calculatePillars(input);
    const fiveElements = analyzeFiveElements(pillars, hasHour);
    const tenGods = calculateTenGods(pillars.day.stem, pillars, hasHour);
    const yongshin = determineYongshin(pillars.day.stem, pillars, fiveElements, hasHour);
    const interpretation = buildInterpretation(pillars, fiveElements, tenGods, yongshin);

    return {
      success: true,
      input,
      hasHour,
      pillars,
      fiveElements,
      tenGods,
      yongshin,
      interpretation,
    };
  } catch (error) {
    const errorInfo = ERROR_MESSAGES.E011;
    return {
      success: false,
      errorCode: errorInfo.code,
      message: errorInfo.message,
      solution: errorInfo.solution,
    };
  }
}

/**
 * 해석 텍스트를 조합한다.
 * JSON 데이터에서 블록을 가져와 조합한다.
 */
function buildInterpretation(
  pillars: SajuPillars,
  fiveElements: FiveElementsResult,
  tenGods: TenGodsResult,
  yongshin: YongshinResult,
): InterpretationResult {
  const dayStem = pillars.day.stem;
  const dayElement = STEM_ELEMENT[dayStem];

  // 1. 일간 특성
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stemData = (dayStemsData as any)[dayStem] as { nature: string; strong: string; weak: string } | undefined;
  const dayStemNature = stemData
    ? (yongshin.dayStrength === '신강' ? `${stemData.nature} ${stemData.strong}` : `${stemData.nature} ${stemData.weak}`)
    : FALLBACK_MESSAGES.tenGod(dayStem);

  // 2. 오행 분포 요약
  const feData = fiveElementsData as {
    summary_templates: Record<string, string>;
    element_hanja: Record<string, string>;
    fallback: { summary: string };
  };
  const fiveElementsSummary = fiveElements.balance === 'balanced'
    ? feData.summary_templates.balanced
    : feData.summary_templates.dominant_and_weak
        .replace('{dominant}', fiveElements.dominant)
        .replace('{dominant_hanja}', feData.element_hanja[fiveElements.dominant] ?? '')
        .replace('{weak}', fiveElements.weak)
        .replace('{weak_hanja}', feData.element_hanja[fiveElements.weak] ?? '');

  // 3. 십성 해석
  const dominantGod = tenGods.dominant;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tgData = (tenGodsData as any)[dominantGod] as { description: string } | undefined;
  const tenGodsSummary = tgData?.description ?? FALLBACK_MESSAGES.tenGod(dominantGod);

  // 4. 용신 의미
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ysData = (yongshinData as any)[yongshin.yongshin] as { meaning: string; personality: string } | undefined;
  const yongshinMeaning = ysData
    ? `${ysData.meaning} ${ysData.personality}`
    : FALLBACK_MESSAGES.yongshin(yongshin.yongshin);

  // 5. 종합 해석 (5~6문장 조합)
  const stemInfo = stemData?.nature ?? '';
  const strengthText = yongshin.dayStrength === '신강'
    ? `${dayElement}(${ELEMENT_HANJA[dayElement]})의 기운이 강한 신강한 사주예요.`
    : `${dayElement}(${ELEMENT_HANJA[dayElement]})의 기운을 보충해야 하는 신약한 사주예요.`;
  const ysText = ysData?.meaning ?? '';
  const ysPersonality = ysData?.personality ?? '';
  const heeshinText = `${yongshin.heeshin}(${ELEMENT_HANJA[yongshin.heeshin]})도 도움이 되는 희신이에요.`;

  const comprehensiveReading = [stemInfo, strengthText, ysText, ysPersonality, heeshinText]
    .filter(Boolean)
    .join(' ');

  return {
    dayStemNature,
    fiveElementsSummary,
    tenGodsSummary,
    yongshinMeaning,
    comprehensiveReading,
  };
}

// 개별 모듈 re-export (테스트용)
export { calculatePillars } from './calendar';
export { analyzeFiveElements } from './five-elements';
export { calculateTenGods } from './ten-gods';
export { determineYongshin } from './yongshin';
