import type { TenGodsResult, TenGod } from '@/lib/saju/types';
import tenGodsData from '@/data/interpretations/ten-gods.json';

interface TenGodsAnalysisProps {
  result: TenGodsResult;
}

interface TenGodInfo {
  title: string;
  description: string;
  hanja: string;
}

export default function TenGodsAnalysis({ result }: TenGodsAnalysisProps) {
  // 등장 횟수 기준 정렬
  const sortedGods = Object.entries(result.counts)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0)) as [TenGod, number][];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 text-center">
        십성(十星) 분석
      </h3>

      {/* 배지 */}
      <div className="flex flex-wrap justify-center gap-2">
        {sortedGods.map(([god, count]) => (
          <span
            key={god}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              god === result.dominant
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {god} {count}
          </span>
        ))}
      </div>

      {/* 해석 */}
      <div className="space-y-3">
        {sortedGods.slice(0, 3).map(([god]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const info = (tenGodsData as any)[god] as TenGodInfo | undefined;
          if (!info) return null;

          return (
            <div key={god} className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-1">
                {info.title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {info.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
