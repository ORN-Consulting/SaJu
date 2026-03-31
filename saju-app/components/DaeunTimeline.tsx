'use client';

import { useState } from 'react';
import type { DaeunResult, Daeun } from '@/lib/saju/types';
import {
  STEM_ELEMENT,
  BRANCH_MAIN_ELEMENT,
  STEM_HANJA,
  BRANCH_HANJA,
  ELEMENT_HANJA,
  ELEMENT_COLORS,
} from '@/lib/saju/constants';

interface DaeunTimelineProps {
  daeun: DaeunResult;
  birthYear: number;
}

const CURRENT_YEAR = new Date().getFullYear();

/** 현재 대운 인덱스 찾기 (startYear~endYear 기준) */
function getCurrentDaeunIndex(daeuns: Daeun[]): number {
  for (let i = 0; i < daeuns.length; i++) {
    const d = daeuns[i];
    if (CURRENT_YEAR >= d.startYear && CURRENT_YEAR <= d.endYear) {
      return i;
    }
  }
  return -1;
}

/** 세운 목록 (현재 년도 기준 하이라이트 포함) */
function SaeunList({ daeun }: { daeun: Daeun }) {
  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <p className="text-xs font-medium text-gray-500 mb-2">세운(歲運) — 연도별 운세</p>
      <div className="grid grid-cols-2 gap-1">
        {daeun.saeuns.map((saeun) => {
          const stemEl = STEM_ELEMENT[saeun.pillar.stem];
          const color = ELEMENT_COLORS[stemEl];
          const isCurrent = saeun.year === CURRENT_YEAR;
          return (
            <div
              key={saeun.year}
              className={`flex items-center justify-between px-2 py-1 rounded text-xs ${
                isCurrent
                  ? `${color.bg} ${color.text} font-bold ring-1 ring-current`
                  : 'text-gray-600'
              }`}
            >
              <span>
                {saeun.year}
                {isCurrent && <span className="ml-1 text-[10px]">▶</span>}
              </span>
              <span className={`font-medium ${isCurrent ? '' : 'text-gray-500'}`}>
                {saeun.pillar.stem}
                <span className="text-gray-400">({STEM_HANJA[saeun.pillar.stem]})</span>
                {saeun.pillar.branch}
                <span className="text-gray-400">({BRANCH_HANJA[saeun.pillar.branch]})</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 대운 카드 하나 */
function DaeunCard({
  daeun,
  isCurrent,
  isExpanded,
  onToggle,
}: {
  daeun: Daeun;
  isCurrent: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const stemEl = STEM_ELEMENT[daeun.pillar.stem];
  const branchEl = BRANCH_MAIN_ELEMENT[daeun.pillar.branch];
  const stemColor = ELEMENT_COLORS[stemEl];
  const branchColor = ELEMENT_COLORS[branchEl];

  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all ${
        isCurrent
          ? 'border-gray-900 shadow-md bg-gray-50'
          : 'border-gray-100 bg-white hover:border-gray-200'
      }`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          isCurrent ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
        }`}>
          {isCurrent ? '현재 대운' : `${daeun.index}대운`}
        </span>
        <span className="text-xs text-gray-400">
          {daeun.startAge}~{daeun.endAge}세
        </span>
      </div>

      {/* 천간지지 */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">
            {daeun.pillar.stem}
            <span className="text-base text-gray-400 ml-0.5">({STEM_HANJA[daeun.pillar.stem]})</span>
          </p>
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${stemColor.bg} ${stemColor.text}`}>
            {stemEl}({ELEMENT_HANJA[stemEl]})
          </span>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">
            {daeun.pillar.branch}
            <span className="text-base text-gray-400 ml-0.5">({BRANCH_HANJA[daeun.pillar.branch]})</span>
          </p>
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${branchColor.bg} ${branchColor.text}`}>
            {branchEl}({ELEMENT_HANJA[branchEl]})
          </span>
        </div>
      </div>

      {/* 시작/종료 년도 */}
      <p className="text-xs text-center text-gray-400 mb-3">
        {daeun.startYear} ~ {daeun.endYear}년
      </p>

      {/* 세운 펼치기 버튼 */}
      <button
        onClick={onToggle}
        className="w-full text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 py-1 rounded hover:bg-gray-100 transition-colors"
        aria-expanded={isExpanded}
      >
        <span>세운 {isExpanded ? '접기' : '펼치기'}</span>
        <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* 세운 목록 */}
      {isExpanded && <SaeunList daeun={daeun} />}
    </div>
  );
}

export default function DaeunTimeline({ daeun, birthYear }: DaeunTimelineProps) {
  const currentIdx = getCurrentDaeunIndex(daeun.daeuns);
  const [expandedIdx, setExpandedIdx] = useState<number>(currentIdx >= 0 ? currentIdx : 0);

  const handleToggle = (idx: number) => {
    setExpandedIdx(expandedIdx === idx ? -1 : idx);
  };

  // 기운세수 표시 텍스트
  const startAgeText = (() => {
    const parts: string[] = [];
    if (daeun.startYears > 0) parts.push(`${daeun.startYears}년`);
    if (daeun.startMonths > 0) parts.push(`${daeun.startMonths}개월`);
    if (daeun.startDays > 0) parts.push(`${daeun.startDays}일`);
    return parts.length > 0 ? parts.join(' ') : '즉시';
  })();

  return (
    <section aria-label="대운 타임라인">
      <h2 className="text-xl font-bold text-gray-900 mb-1">대운(大運) — 10년 운세 흐름</h2>
      <p className="text-sm text-gray-500 mb-4">
        {daeun.isForward ? '순행(順行)' : '역행(逆行)'} ·{' '}
        출생 후 <strong>{startAgeText}</strong>부터 첫 대운 시작 ·{' '}
        {daeun.daeuns[0]?.startAge}세부터 10년 단위로 운세가 바뀝니다
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {daeun.daeuns.map((d, idx) => (
          <DaeunCard
            key={d.index}
            daeun={d}
            isCurrent={idx === currentIdx}
            isExpanded={expandedIdx === idx}
            onToggle={() => handleToggle(idx)}
          />
        ))}
      </div>

      {/* 현재 대운이 없는 경우 (대운 시작 전 / 100세 이후) */}
      {currentIdx < 0 && (
        <p className="text-sm text-gray-400 mt-3 text-center">
          현재 나이({CURRENT_YEAR - birthYear + 1}세)는 대운 범위 밖입니다.
        </p>
      )}
    </section>
  );
}
