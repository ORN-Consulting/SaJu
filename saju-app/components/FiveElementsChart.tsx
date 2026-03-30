import type { FiveElementsResult, Element } from '@/lib/saju/types';
import { ELEMENTS, ELEMENT_HANJA, ELEMENT_COLORS } from '@/lib/saju/constants';

interface FiveElementsChartProps {
  result: FiveElementsResult;
  summary: string;
}

export default function FiveElementsChart({ result, summary }: FiveElementsChartProps) {
  const maxCount = Math.max(...ELEMENTS.map(e => result.distribution[e]), 1);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 text-center">
        오행(五行) 분포
      </h3>

      {/* 바 차트 */}
      <div className="space-y-3">
        {ELEMENTS.map((element) => {
          const count = result.distribution[element];
          const color = ELEMENT_COLORS[element];
          const isDominant = element === result.dominant;
          const isWeak = element === result.weak;

          return (
            <div key={element} className="flex items-center gap-3">
              <span className="w-16 text-sm font-medium text-gray-700 text-right">
                {element}({ELEMENT_HANJA[element]})
              </span>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%`,
                    backgroundColor: color.hex,
                    minWidth: count > 0 ? '8px' : '0',
                  }}
                  role="progressbar"
                  aria-valuenow={count}
                  aria-valuemin={0}
                  aria-valuemax={maxCount}
                  aria-label={`${element} ${count}개`}
                />
              </div>
              <span className="w-8 text-sm text-gray-600 tabular-nums">{count}</span>
              <span className="w-20 text-xs">
                {isDominant && <span className="text-red-500 font-medium">가장 강함</span>}
                {isWeak && <span className="text-blue-500 font-medium">가장 약함</span>}
              </span>
            </div>
          );
        })}
      </div>

      {/* 요약 */}
      <p className="text-sm text-gray-600 text-center bg-gray-50 rounded-lg p-3 leading-relaxed">
        {summary}
      </p>
    </div>
  );
}
