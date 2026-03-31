'use client';

import type { SajuAnalysisResult } from '@/lib/saju/types';
import PillarDisplay from './PillarDisplay';
import FiveElementsChart from './FiveElementsChart';
import TenGodsAnalysis from './TenGodsAnalysis';
import YongshinResult from './YongshinResult';
import DaeunTimeline from './DaeunTimeline';

interface SajuResultProps {
  result: SajuAnalysisResult;
  onReset: () => void;
}

function InputSummaryBar({ result }: { result: SajuAnalysisResult }) {
  const { input, hasHour } = result;
  const calendarType = input.isLunar ? '음력' : '양력';
  const timeText = hasHour ? `${input.hour}시` : '시간 미상';
  const genderText = input.gender === 'M' ? '남성' : '여성';

  return (
    <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg py-2 px-4">
      {input.year}년 {input.month}월 {input.day}일 ({calendarType}) {timeText} · {genderText}
    </div>
  );
}

export default function SajuResult({ result, onReset }: SajuResultProps) {
  const sections = [
    { delay: 0, content: <InputSummaryBar result={result} /> },
    {
      delay: 200,
      content: <PillarDisplay pillars={result.pillars} tenGods={result.tenGods} hasHour={result.hasHour} />,
    },
    {
      delay: 400,
      content: <FiveElementsChart result={result.fiveElements} summary={result.interpretation.fiveElementsSummary} />,
    },
    { delay: 600, content: <TenGodsAnalysis result={result.tenGods} /> },
    {
      delay: 800,
      content: (
        <YongshinResult
          result={result.yongshin}
          comprehensiveReading={result.interpretation.comprehensiveReading}
        />
      ),
    },
    {
      delay: 1000,
      content: (
        <DaeunTimeline
          daeun={result.daeun}
          birthYear={result.input.year}
        />
      ),
    },
  ];

  return (
    <div id="result-area" className="py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {sections.map((section, i) => (
          <div
            key={i}
            className="animate-fade-in-up"
            style={{ animationDelay: `${section.delay}ms` }}
          >
            {section.content}
          </div>
        ))}

        {/* 다시 분석하기 */}
        <div
          className="text-center animate-fade-in-up"
          style={{ animationDelay: '1200ms' }}
        >
          <button
            onClick={onReset}
            className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            다시 분석하기
          </button>
        </div>
      </div>
    </div>
  );
}
