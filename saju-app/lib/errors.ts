/**
 * 에러 코드 및 메시지 상수
 *
 * 참조: docs/product-specs/error-states.md 섹션 7
 */

export interface ErrorMessage {
  code: string;
  message: string;
  solution: string;
}

export const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  // ── 입력 단계 ──
  E001: { code: 'E001', message: '연도를 선택해 주세요.', solution: '' },
  E002: { code: 'E002', message: '월을 선택해 주세요.', solution: '' },
  E003: { code: 'E003', message: '일을 선택해 주세요.', solution: '' },
  E004: { code: 'E004', message: '시간을 선택해 주세요.', solution: "모르시면 '모름'을 선택할 수 있어요." },
  E005: { code: 'E005', message: '성별을 선택해 주세요.', solution: '' },
  E006: { code: 'E006', message: '미래 날짜는 분석할 수 없어요.', solution: '생년월일을 다시 확인해 주세요.' },
  E007: { code: 'E007', message: '존재하지 않는 날짜예요.', solution: '일(日)을 다시 확인해 주세요.' },
  E008: { code: 'E008', message: '해당 음력 날짜는 존재하지 않아요.', solution: '날짜를 확인하거나 양력으로 입력해 주세요.' },
  E009: { code: 'E009', message: '해당 연도/월에는 윤달이 없어요.', solution: '윤달 체크를 해제하거나 날짜를 확인해 주세요.' },
  E010: { code: 'E010', message: '지원 가능한 범위는 1920년부터예요.', solution: '연도를 다시 확인해 주세요.' },

  // ── 계산 단계 ──
  E011: { code: 'E011', message: '사주 계산 중 문제가 발생했어요.', solution: '날짜를 다시 확인하거나, 잠시 후 다시 시도해 주세요.' },
};

/** 주의 배너 (에러가 아닌 안내) */
export const WARNING_MESSAGES: Record<string, { code: string; message: string; detail: string }> = {
  W001: { code: 'W001', message: '절기 경계에 해당하는 날짜예요.', detail: '결과가 정확하지 않을 수 있어요.' },
  W002: { code: 'W002', message: '시간 미상으로 년·월·일 기준 분석이에요.', detail: '태어난 시간을 알면 시주까지 분석할 수 있어요.' },
};

/** 해석 텍스트 fallback */
export const FALLBACK_MESSAGES = {
  tenGod: (name: string) => `${name}에 해당해요. 자세한 해석은 준비 중이에요.`,
  yongshin: (element: string) => `${element}이(가) 용신이에요. 자세한 해석은 준비 중이에요.`,
  fiveElements: '오행의 분포를 분석했어요. 자세한 해석은 준비 중이에요.',
};
