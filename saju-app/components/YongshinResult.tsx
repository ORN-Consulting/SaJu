import type { YongshinResult as YongshinResultType, Element } from '@/lib/saju/types';
import { ELEMENT_HANJA, ELEMENT_COLORS } from '@/lib/saju/constants';

interface YongshinResultProps {
  result: YongshinResultType;
  comprehensiveReading: string;
}

/** 오행을 일상 단어로 풀어쓰기 */
const ELEMENT_PLAIN: Record<Element, string> = {
  '목': '나무의 기운 — 성장, 시작, 창의성',
  '화': '불의 기운 — 열정, 표현, 활동',
  '토': '흙의 기운 — 안정, 신뢰, 중재',
  '금': '쇠의 기운 — 결단, 정의, 원칙',
  '수': '물의 기운 — 지혜, 유연함, 소통',
};

export default function YongshinResult({ result, comprehensiveReading }: YongshinResultProps) {
  const yColor = ELEMENT_COLORS[result.yongshin];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 text-center">
        나에게 필요한 기운
      </h3>

      {/* 용신 카드 — 쉬운 설명 추가 */}
      <div className="bg-gray-50 rounded-xl p-6 text-center space-y-3">
        <p className="text-sm text-gray-500">당신에게 가장 도움이 되는 기운은</p>
        <p className="text-3xl font-bold" style={{ color: yColor.hex }}>
          {result.yongshin}({ELEMENT_HANJA[result.yongshin]})
        </p>
        <p className="text-sm text-gray-500">
          {ELEMENT_PLAIN[result.yongshin]}
        </p>

        <div className="pt-3 border-t border-gray-200 space-y-2">
          <div className="flex justify-center gap-6 text-sm text-gray-600">
            <span>
              타고난 기운:{' '}
              <strong>{result.dayStrength === '신강' ? '강한 편' : '약한 편'}</strong>
            </span>
          </div>
          <div className="flex justify-center gap-4 text-xs text-gray-400">
            <span title="나를 보조해주는 기운">
              도움 기운: <strong className="text-gray-600">{result.heeshin}({ELEMENT_HANJA[result.heeshin]})</strong>
            </span>
            <span title="나에게 부담이 되는 기운">
              주의 기운: <strong className="text-gray-600">{result.gishin}({ELEMENT_HANJA[result.gishin]})</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 종합 해석 */}
      <div className="space-y-2">
        <h4 className="text-base font-semibold text-gray-800">종합 해석</h4>
        <p className="text-sm text-gray-600 leading-relaxed bg-white border border-gray-100 rounded-lg p-4">
          {comprehensiveReading}
        </p>
      </div>
    </div>
  );
}
