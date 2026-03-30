import type { SajuPillars, TenGodsResult } from '@/lib/saju/types';
import PillarCard from './PillarCard';

interface PillarDisplayProps {
  pillars: SajuPillars;
  tenGods: TenGodsResult;
  hasHour: boolean;
}

export default function PillarDisplay({ pillars, tenGods, hasHour }: PillarDisplayProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 text-center">
        사주팔자(四柱八字)
      </h3>
      <div className={`grid gap-3 ${hasHour ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
        {hasHour && pillars.hour && (
          <PillarCard
            pillar={pillars.hour}
            label="시주(時柱)"
            stemTenGod={tenGods.hourStem}
            branchTenGod={tenGods.hourBranch!}
          />
        )}
        <PillarCard
          pillar={pillars.day}
          label="일주(日柱)"
          stemTenGod={null}
          branchTenGod={tenGods.dayBranch}
          isDay
        />
        <PillarCard
          pillar={pillars.month}
          label="월주(月柱)"
          stemTenGod={tenGods.monthStem}
          branchTenGod={tenGods.monthBranch}
        />
        <PillarCard
          pillar={pillars.year}
          label="년주(年柱)"
          stemTenGod={tenGods.yearStem}
          branchTenGod={tenGods.yearBranch}
        />
      </div>
      {!hasHour && (
        <p className="text-center text-xs text-gray-400">
          태어난 시간을 알면 시주(時柱)까지 분석할 수 있어요
        </p>
      )}
    </div>
  );
}
