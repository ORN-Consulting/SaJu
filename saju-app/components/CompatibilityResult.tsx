'use client';

import type { CompatibilityResult as CompatResult, CompatibilityGrade } from '@/lib/saju/types';
import {
  STEM_HANJA,
  BRANCH_HANJA,
  ELEMENT_HANJA,
  ELEMENT_COLORS,
  STEM_ELEMENT,
  BRANCH_MAIN_ELEMENT,
} from '@/lib/saju/constants';

interface CompatibilityResultProps {
  result: CompatResult;
  onReset: () => void;
}

const GRADE_STYLES: Record<CompatibilityGrade, { bg: string; text: string; border: string; emoji: string }> = {
  '천생연분': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', emoji: '💕' },
  '좋은 궁합': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', emoji: '💛' },
  '보통': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', emoji: '🤝' },
  '노력 필요': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', emoji: '💪' },
  '주의 필요': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', emoji: '⚡' },
};

function PersonSummary({ label, result }: { label: string; result: CompatResult['person1'] }) {
  const { input, pillars, hasHour } = result;
  const calendarType = input.isLunar ? '음력' : '양력';
  const timeText = hasHour ? `${input.hour}시` : '미상';
  const genderText = input.gender === 'M' ? '남' : '여';

  return (
    <div className="text-center">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-xs text-gray-500 mb-2">
        {input.year}.{input.month}.{input.day} ({calendarType}) {timeText} · {genderText}
      </p>
      <div className="flex justify-center gap-2">
        {[pillars.year, pillars.month, pillars.day, ...(pillars.hour ? [pillars.hour] : [])].map((p, i) => {
          const stemEl = STEM_ELEMENT[p.stem];
          const branchEl = BRANCH_MAIN_ELEMENT[p.branch];
          const sColor = ELEMENT_COLORS[stemEl];
          const bColor = ELEMENT_COLORS[branchEl];
          return (
            <div key={i} className="flex flex-col items-center text-xs">
              <span className={`font-bold ${sColor.text}`}>
                {p.stem}({STEM_HANJA[p.stem]})
              </span>
              <span className={`font-bold ${bColor.text}`}>
                {p.branch}({BRANCH_HANJA[p.branch]})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 85 ? 'bg-red-400' :
    score >= 70 ? 'bg-green-400' :
    score >= 50 ? 'bg-blue-400' :
    score >= 35 ? 'bg-yellow-400' : 'bg-gray-400';

  return (
    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${color}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

export default function CompatibilityResultView({ result, onReset }: CompatibilityResultProps) {
  const gradeStyle = GRADE_STYLES[result.grade];
  const yukhaps = result.jijiRelations.filter((r) => r.type === '육합');
  const samhaps = result.jijiRelations.filter((r) => r.type === '삼합');
  const chungs = result.jijiRelations.filter((r) => r.type === '충');

  const sections = [
    // 등급 + 점수
    {
      delay: 0,
      content: (
        <div className={`text-center rounded-2xl border-2 ${gradeStyle.border} ${gradeStyle.bg} p-8`}>
          <p className="text-4xl mb-2">{gradeStyle.emoji}</p>
          <h3 className={`text-2xl font-bold ${gradeStyle.text} mb-2`}>{result.grade}</h3>
          <p className="text-3xl font-bold text-gray-900 mb-3">{result.totalScore}점</p>
          <ScoreBar score={result.totalScore} />
        </div>
      ),
    },
    // 사주 비교
    {
      delay: 200,
      content: (
        <div className="grid grid-cols-2 gap-4 items-start">
          <PersonSummary label="첫 번째" result={result.person1} />
          <PersonSummary label="두 번째" result={result.person2} />
        </div>
      ),
    },
    // 천간합
    {
      delay: 400,
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">천간합(天干合)</h3>
          {result.cheonganHaps.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.cheonganHaps.map((h, i) => {
                const elColor = ELEMENT_COLORS[h.resultElement];
                return (
                  <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium ${elColor.bg} ${elColor.text}`}>
                    {h.stem1}({STEM_HANJA[h.stem1]}) + {h.stem2}({STEM_HANJA[h.stem2]}) → {h.resultElement}({ELEMENT_HANJA[h.resultElement]})
                    <span className="text-xs opacity-70 ml-1">{h.position1}·{h.position2}</span>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">천간합이 없습니다</p>
          )}
        </div>
      ),
    },
    // 지지 관계
    {
      delay: 600,
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">지지 관계(地支 合·沖)</h3>
          <div className="space-y-2">
            {yukhaps.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {yukhaps.map((r, i) => (
                  <span key={`y${i}`} className="px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    육합: {r.branch1}({BRANCH_HANJA[r.branch1]}) + {r.branch2}({BRANCH_HANJA[r.branch2]})
                    {r.resultElement && ` → ${r.resultElement}`}
                  </span>
                ))}
              </div>
            )}
            {samhaps.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {samhaps.map((r, i) => (
                  <span key={`s${i}`} className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    삼합: {r.position1} → {r.position2}
                  </span>
                ))}
              </div>
            )}
            {chungs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {chungs.map((r, i) => (
                  <span key={`c${i}`} className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700">
                    충: {r.branch1}({BRANCH_HANJA[r.branch1]}) ↔ {r.branch2}({BRANCH_HANJA[r.branch2]})
                  </span>
                ))}
              </div>
            )}
            {yukhaps.length === 0 && samhaps.length === 0 && chungs.length === 0 && (
              <p className="text-sm text-gray-400">특별한 지지 관계가 없습니다</p>
            )}
          </div>
        </div>
      ),
    },
    // 오행 상성 + 일간 관계
    {
      delay: 800,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">오행 상성</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4 text-center text-sm mb-3">
                <div>
                  <p className="text-gray-500 text-xs mb-1">첫 번째</p>
                  <p>
                    강: <span className={ELEMENT_COLORS[result.elementCompatibility.person1Dominant].text + ' font-bold'}>
                      {result.elementCompatibility.person1Dominant}({ELEMENT_HANJA[result.elementCompatibility.person1Dominant]})
                    </span>{' '}
                    약: <span className={ELEMENT_COLORS[result.elementCompatibility.person1Weak].text + ' font-bold'}>
                      {result.elementCompatibility.person1Weak}({ELEMENT_HANJA[result.elementCompatibility.person1Weak]})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">두 번째</p>
                  <p>
                    강: <span className={ELEMENT_COLORS[result.elementCompatibility.person2Dominant].text + ' font-bold'}>
                      {result.elementCompatibility.person2Dominant}({ELEMENT_HANJA[result.elementCompatibility.person2Dominant]})
                    </span>{' '}
                    약: <span className={ELEMENT_COLORS[result.elementCompatibility.person2Weak].text + ' font-bold'}>
                      {result.elementCompatibility.person2Weak}({ELEMENT_HANJA[result.elementCompatibility.person2Weak]})
                    </span>
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center">{result.elementCompatibility.description}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">일간 관계</h3>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-lg font-bold text-gray-800 mb-1">
                {result.dayStemRelation.person1DayStem}({STEM_HANJA[result.dayStemRelation.person1DayStem]}) ↔{' '}
                {result.dayStemRelation.person2DayStem}({STEM_HANJA[result.dayStemRelation.person2DayStem]})
              </p>
              <p className="text-sm text-gray-500 mb-2">
                {result.dayStemRelation.tenGod1to2} / {result.dayStemRelation.tenGod2to1}
                {result.dayStemRelation.hasCheonganHap && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">천간합</span>
                )}
              </p>
              <p className="text-sm text-gray-600">{result.dayStemRelation.description}</p>
            </div>
          </div>
        </div>
      ),
    },
    // 점수 상세
    {
      delay: 1000,
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">점수 상세</h3>
          <div className="space-y-2">
            {result.scores.map((s) => (
              <div key={s.category} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-20 shrink-0">{s.category}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.score >= 0 ? 'bg-blue-400' : 'bg-red-400'}`}
                    style={{ width: `${Math.abs(s.score) / (s.maxScore || 15) * 100}%` }}
                  />
                </div>
                <span className={`text-sm font-medium w-12 text-right ${s.score >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                  {s.score > 0 ? `+${s.score}` : s.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    // 종합 해석
    {
      delay: 1200,
      content: (
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-2">종합 해석</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p>
        </div>
      ),
    },
  ];

  return (
    <div id="compat-result-area" className="py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {sections.map((section, i) => (
          <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${section.delay}ms` }}>
            {section.content}
          </div>
        ))}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '1400ms' }}>
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
