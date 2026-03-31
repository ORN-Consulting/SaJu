'use client';

import type { CompatibilityResult as CompatResult, CompatibilityGrade, Element } from '@/lib/saju/types';
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

/** 오행을 쉬운 말로 */
const ELEMENT_PLAIN: Record<Element, string> = {
  '목': '나무', '화': '불', '토': '흙', '금': '쇠', '수': '물',
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
    // 성격 조화 (구 천간합)
    {
      delay: 400,
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">성격 조화</h3>
          <p className="text-xs text-gray-400 mb-3">두 사람의 성격이 자연스럽게 맞아떨어지는 부분이에요</p>
          {result.cheonganHaps.length > 0 ? (
            <div className="space-y-2">
              {result.cheonganHaps.map((h, i) => {
                const elColor = ELEMENT_COLORS[h.resultElement];
                return (
                  <div key={i} className={`rounded-lg p-3 ${elColor.bg}`}>
                    <p className={`text-sm font-medium ${elColor.text}`}>
                      {h.stem1}({STEM_HANJA[h.stem1]}) + {h.stem2}({STEM_HANJA[h.stem2]}) → {ELEMENT_PLAIN[h.resultElement]}의 기운으로 합쳐져요
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      두 글자가 만나 새로운 조화를 이루는 좋은 조합이에요
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3">
              성격이 직접적으로 맞물리는 조합은 없지만, 다른 부분에서 궁합을 확인하세요
            </p>
          )}
        </div>
      ),
    },
    // 끌림과 갈등 (구 지지 관계)
    {
      delay: 600,
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">끌림과 갈등</h3>
          <p className="text-xs text-gray-400 mb-3">서로에 대한 끌림, 시너지, 그리고 주의할 점이에요</p>
          <div className="space-y-2">
            {yukhaps.length > 0 && (
              <div>
                {yukhaps.map((r, i) => (
                  <div key={`y${i}`} className="rounded-lg p-3 bg-green-50 mb-2">
                    <p className="text-sm font-medium text-green-700">
                      💚 서로 끌리는 조합: {r.branch1}({BRANCH_HANJA[r.branch1]}) + {r.branch2}({BRANCH_HANJA[r.branch2]})
                      {r.resultElement && ` → ${ELEMENT_PLAIN[r.resultElement]}의 기운`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      자연스러운 유대감이 생기는 관계예요. 함께하면 안정감을 느낄 수 있어요.
                    </p>
                  </div>
                ))}
              </div>
            )}
            {samhaps.length > 0 && (
              <div>
                {samhaps.map((r, i) => (
                  <div key={`s${i}`} className="rounded-lg p-3 bg-blue-50 mb-2">
                    <p className="text-sm font-medium text-blue-700">
                      💙 시너지 조합: {r.position1} → {r.position2}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      세 가지 기운이 모여 강한 팀워크를 만들어요. 함께 무언가를 이루기 좋은 조합이에요.
                    </p>
                  </div>
                ))}
              </div>
            )}
            {chungs.length > 0 && (
              <div>
                {chungs.map((r, i) => (
                  <div key={`c${i}`} className="rounded-lg p-3 bg-red-50 mb-2">
                    <p className="text-sm font-medium text-red-700">
                      ⚡ 부딪힐 수 있는 부분: {r.branch1}({BRANCH_HANJA[r.branch1]}) ↔ {r.branch2}({BRANCH_HANJA[r.branch2]})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      성격이나 가치관이 반대인 부분이에요. 차이를 인정하면 오히려 성장의 기회가 돼요.
                    </p>
                  </div>
                ))}
              </div>
            )}
            {yukhaps.length === 0 && samhaps.length === 0 && chungs.length === 0 && (
              <p className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3">
                특별히 강하게 끌리거나 부딪히는 부분은 없어요. 무난한 관계예요.
              </p>
            )}
          </div>
        </div>
      ),
    },
    // 기운 보완 + 핵심 관계
    {
      delay: 800,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">기운 보완</h3>
            <p className="text-xs text-gray-400 mb-3">서로의 부족한 부분을 채워줄 수 있는지 살펴봐요</p>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4 text-center text-sm mb-3">
                <div>
                  <p className="text-gray-500 text-xs mb-1">첫 번째 사람</p>
                  <p>
                    강한 기운: <span className={ELEMENT_COLORS[result.elementCompatibility.person1Dominant].text + ' font-bold'}>
                      {ELEMENT_PLAIN[result.elementCompatibility.person1Dominant]}
                    </span>
                    <br />
                    부족한 기운: <span className={ELEMENT_COLORS[result.elementCompatibility.person1Weak].text + ' font-bold'}>
                      {ELEMENT_PLAIN[result.elementCompatibility.person1Weak]}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">두 번째 사람</p>
                  <p>
                    강한 기운: <span className={ELEMENT_COLORS[result.elementCompatibility.person2Dominant].text + ' font-bold'}>
                      {ELEMENT_PLAIN[result.elementCompatibility.person2Dominant]}
                    </span>
                    <br />
                    부족한 기운: <span className={ELEMENT_COLORS[result.elementCompatibility.person2Weak].text + ' font-bold'}>
                      {ELEMENT_PLAIN[result.elementCompatibility.person2Weak]}
                    </span>
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center">{result.elementCompatibility.description}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">핵심 관계</h3>
            <p className="text-xs text-gray-400 mb-3">두 사람의 본질적인 성격이 만들어내는 관계예요</p>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-lg font-bold text-gray-800 mb-2">
                {result.dayStemRelation.person1DayStem}({STEM_HANJA[result.dayStemRelation.person1DayStem]}) ↔{' '}
                {result.dayStemRelation.person2DayStem}({STEM_HANJA[result.dayStemRelation.person2DayStem]})
              </p>
              {result.dayStemRelation.hasCheonganHap && (
                <p className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 inline-block mb-2">
                  자연스럽게 하나로 합쳐지는 조합
                </p>
              )}
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
          <h3 className="text-lg font-bold text-gray-900 mb-1">점수 상세</h3>
          <p className="text-xs text-gray-400 mb-3">각 항목별로 궁합 점수가 어떻게 구성되었는지 보여드려요</p>
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
