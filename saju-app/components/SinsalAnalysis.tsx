import type { SinsalResult, SinsalEntry } from '@/lib/saju/types';
import { SINSAL_HANJA, BRANCH_HANJA } from '@/lib/saju/constants';
import sinsalData from '@/data/interpretations/sinsal.json';

interface SinsalAnalysisProps {
  result: SinsalResult;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '역마': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  '도화': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  '화개': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

function SinsalCard({ entry }: { entry: SinsalEntry }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (sinsalData as any)[entry.type] as {
    icon: string;
    title: string;
    description: string;
    positive: string;
    negative: string;
    keywords: string[];
  } | undefined;

  const color = TYPE_COLORS[entry.type];
  const foundPositions = entry.foundIn.join(', ');

  return (
    <div className={`rounded-xl border p-4 ${color.bg} ${color.border}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{data?.icon}</span>
        <h4 className={`font-semibold ${color.text}`}>
          {data?.title ?? entry.type}({SINSAL_HANJA[entry.type]})
        </h4>
        <span className={`text-xs px-2 py-0.5 rounded-full ${color.bg} ${color.text} border ${color.border}`}>
          {entry.basisLabel} {entry.basisBranch}({BRANCH_HANJA[entry.basisBranch]}) 기준
        </span>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mb-2">
        {data?.description}
      </p>

      <p className="text-xs text-gray-500 mb-2">
        발견 위치: <strong>{foundPositions}</strong>에서{' '}
        {entry.targetBranch}({BRANCH_HANJA[entry.targetBranch]}) 발견
      </p>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="bg-white/60 rounded-lg p-2">
          <p className="text-xs font-medium text-green-700 mb-1">긍정적 의미</p>
          <p className="text-xs text-gray-600">{data?.positive}</p>
        </div>
        <div className="bg-white/60 rounded-lg p-2">
          <p className="text-xs font-medium text-amber-700 mb-1">주의할 점</p>
          <p className="text-xs text-gray-600">{data?.negative}</p>
        </div>
      </div>

      {data?.keywords && (
        <div className="flex flex-wrap gap-1 mt-2">
          {data.keywords.map((kw) => (
            <span key={kw} className={`text-xs px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
              #{kw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SinsalAnalysis({ result }: SinsalAnalysisProps) {
  // 중복 제거: 같은 type이 일지·년지 모두에서 발견되면 하나만 표시
  const uniqueDetected: SinsalEntry[] = [];
  const seen = new Set<string>();
  for (const entry of result.detected) {
    const key = entry.type;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueDetected.push(entry);
    }
  }

  return (
    <section aria-label="신살 분석">
      <h2 className="text-xl font-bold text-gray-900 mb-1">신살(神煞) 분석</h2>
      <p className="text-sm text-gray-500 mb-4">
        사주에 나타난 특별한 기운을 분석합니다
      </p>

      {uniqueDetected.length > 0 ? (
        <div className="space-y-3">
          {uniqueDetected.map((entry) => (
            <SinsalCard key={`${entry.type}-${entry.basisLabel}`} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-400">
            역마·도화·화개 신살이 발견되지 않았습니다
          </p>
        </div>
      )}
    </section>
  );
}
