import type { Pillar, TenGod, Element } from '@/lib/saju/types';
import { STEM_ELEMENT, BRANCH_MAIN_ELEMENT, STEM_HANJA, BRANCH_HANJA, ELEMENT_HANJA, ELEMENT_COLORS } from '@/lib/saju/constants';

interface PillarCardProps {
  pillar: Pillar;
  label: string;
  stemTenGod: TenGod | null; // null = 일간
  branchTenGod: TenGod;
  isDay?: boolean;
}

function ElementBadge({ element }: { element: Element }) {
  const color = ELEMENT_COLORS[element];
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.hex }} />
      {element}({ELEMENT_HANJA[element]})
    </span>
  );
}

export default function PillarCard({ pillar, label, stemTenGod, branchTenGod, isDay }: PillarCardProps) {
  const stemElement = STEM_ELEMENT[pillar.stem];
  const branchElement = BRANCH_MAIN_ELEMENT[pillar.branch];

  return (
    <div className={`flex flex-col items-center p-4 rounded-xl border-2 transition-shadow ${
      isDay ? 'border-gray-900 shadow-md bg-gray-50' : 'border-gray-100 bg-white'
    }`}>
      {/* 천간 십성 */}
      <span className="text-xs text-gray-400 mb-2 h-4">
        {stemTenGod ?? '일간'}
      </span>

      {/* 천간 */}
      <span className="text-2xl font-bold text-gray-900">
        {pillar.stem}
        <span className="text-lg text-gray-400 ml-0.5">({STEM_HANJA[pillar.stem]})</span>
      </span>
      <ElementBadge element={stemElement} />

      {/* 구분선 */}
      <div className="w-full border-t border-gray-200 my-3" />

      {/* 지지 */}
      <span className="text-2xl font-bold text-gray-900">
        {pillar.branch}
        <span className="text-lg text-gray-400 ml-0.5">({BRANCH_HANJA[pillar.branch]})</span>
      </span>
      <ElementBadge element={branchElement} />

      {/* 지지 십성 */}
      <span className="text-xs text-gray-400 mt-2 h-4">
        {branchTenGod}
      </span>

      {/* 기둥 라벨 */}
      <span className={`mt-3 text-xs font-medium ${isDay ? 'text-gray-900' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}
