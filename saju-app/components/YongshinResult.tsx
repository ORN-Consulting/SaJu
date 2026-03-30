import type { YongshinResult as YongshinResultType } from '@/lib/saju/types';
import { ELEMENT_HANJA, ELEMENT_COLORS } from '@/lib/saju/constants';

interface YongshinResultProps {
  result: YongshinResultType;
  comprehensiveReading: string;
}

export default function YongshinResult({ result, comprehensiveReading }: YongshinResultProps) {
  const yColor = ELEMENT_COLORS[result.yongshin];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 text-center">
        용신(用神) 분석
      </h3>

      {/* 용신 카드 */}
      <div className="bg-gray-50 rounded-xl p-6 text-center space-y-3">
        <p className="text-sm text-gray-500">당신의 용신은</p>
        <p className="text-3xl font-bold" style={{ color: yColor.hex }}>
          {result.yongshin}({ELEMENT_HANJA[result.yongshin]})
        </p>
        <div className="flex justify-center gap-6 text-sm text-gray-600">
          <span>일간 강약: <strong>{result.dayStrength}</strong></span>
          <span>희신: <strong>{result.heeshin}({ELEMENT_HANJA[result.heeshin]})</strong></span>
          <span>기신: <strong>{result.gishin}({ELEMENT_HANJA[result.gishin]})</strong></span>
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
