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
import { calculateDaeun } from './daeun';
import { analyzeSinsal } from './sinsal';
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
    const daeun = calculateDaeun(input);
    const sinsal = analyzeSinsal(pillars, hasHour);

    return {
      success: true,
      input,
      hasHour,
      pillars,
      fiveElements,
      tenGods,
      yongshin,
      interpretation,
      daeun,
      sinsal,
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

  // 5. 종합 해석 (일반인 친화적 표현)
  const stemInfo = stemData?.nature ?? '';

  // 오행을 일상 언어로 풀어서 설명
  const ELEMENT_PLAIN: Record<Element, string> = {
    '목': '나무', '화': '불', '토': '흙', '금': '쇠', '수': '물',
  };

  // 신강/신약을 전문 용어 없이 설명
  const strengthText = yongshin.dayStrength === '신강'
    ? `타고난 ${ELEMENT_PLAIN[dayElement]}의 기운이 강한 편이에요. 자기 주도적이고 에너지가 넘치는 타입이에요.`
    : `타고난 ${ELEMENT_PLAIN[dayElement]}의 기운이 다소 약한 편이에요. 주변의 도움과 환경이 뒷받침되면 더 크게 빛날 수 있어요.`;

  // 용신을 '나에게 도움이 되는 기운'으로 자연스럽게 설명
  const ysPersonality = ysData?.personality ?? '';

  // 희신·기신을 실생활 조언으로 전환
  const ELEMENT_LIFESTYLE: Record<Element, string> = {
    '목': '자연 속 산책이나 새로운 배움',
    '화': '활발한 사교 활동이나 운동',
    '토': '규칙적인 생활과 안정된 환경',
    '금': '체계적인 계획과 정돈된 공간',
    '수': '독서나 명상, 여행',
  };

  const heeshinAdvice = `일상에서 ${ELEMENT_LIFESTYLE[yongshin.heeshin] ?? '균형 잡힌 활동'}을 가까이하면 운기를 높이는 데 도움이 돼요.`;

  // 색상·계절 조언 추가
  const ysLifestyle = (() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (yongshinData as any)[yongshin.yongshin] as { color?: string; season?: string } | undefined;
    if (!data) return '';
    const parts: string[] = [];
    if (data.color) parts.push(data.color);
    if (data.season) parts.push(data.season);
    return parts.join(' ');
  })();

  const comprehensiveReading = [stemInfo, strengthText, ysPersonality, heeshinAdvice, ysLifestyle]
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
export { calculateDaeun } from './daeun';
export { analyzeSinsal } from './sinsal';
