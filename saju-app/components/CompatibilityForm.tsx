'use client';

import { useState, useCallback } from 'react';
import type { BirthInput, Gender } from '@/lib/saju/types';
import { HOUR_LABELS } from '@/lib/saju/constants';

interface CompatibilityFormProps {
  onSubmit: (person1: BirthInput, person2: BirthInput) => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const START_YEAR = 1920;

/** 한 사람의 입력 상태 */
interface PersonState {
  isLunar: boolean;
  isLeapMonth: boolean;
  year: number | '';
  month: number | '';
  day: number | '';
  hourMode: 'sijin' | 'exact';
  sijinIndex: number | '' | 'unknown';
  exactHour: number | '';
  exactMinute: number;
  gender: Gender | '';
}

const initialState: PersonState = {
  isLunar: false,
  isLeapMonth: false,
  year: '',
  month: '',
  day: '',
  hourMode: 'sijin',
  sijinIndex: '',
  exactHour: '',
  exactMinute: 0,
  gender: '',
};

function getHour(s: PersonState): number | null {
  if (s.hourMode === 'sijin') {
    if (s.sijinIndex === 'unknown' || s.sijinIndex === '') return null;
    const hourMap = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
    return hourMap[s.sijinIndex as number];
  }
  return s.exactHour === '' ? null : (s.exactHour as number);
}

function isComplete(s: PersonState): boolean {
  return (
    s.year !== '' &&
    s.month !== '' &&
    s.day !== '' &&
    (s.hourMode === 'sijin' ? s.sijinIndex !== '' : s.exactHour !== '') &&
    s.gender !== ''
  );
}

function toBirthInput(s: PersonState): BirthInput {
  return {
    year: s.year as number,
    month: s.month as number,
    day: s.day as number,
    hour: getHour(s),
    minute: s.hourMode === 'exact' ? s.exactMinute : 0,
    isLunar: s.isLunar,
    isLeapMonth: s.isLunar ? s.isLeapMonth : false,
    gender: s.gender as Gender,
  };
}

/** 한 사람분 입력 폼 */
function PersonInput({
  label,
  state,
  onChange,
}: {
  label: string;
  state: PersonState;
  onChange: (s: PersonState) => void;
}) {
  const getDaysInMonth = useCallback((): number => {
    if (!state.year || !state.month) return 31;
    if (state.isLunar) return 30;
    return new Date(state.year as number, state.month as number, 0).getDate();
  }, [state.year, state.month, state.isLunar]);

  const update = (partial: Partial<PersonState>) => onChange({ ...state, ...partial });

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-800 text-center">{label}</h3>

      {/* 양력/음력 */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => update({ isLunar: false, isLeapMonth: false })}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !state.isLunar ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          양력
        </button>
        <button
          onClick={() => update({ isLunar: true })}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            state.isLunar ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          음력
        </button>
      </div>
      {state.isLunar && (
        <label className="flex items-center justify-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={state.isLeapMonth}
            onChange={(e) => update({ isLeapMonth: e.target.checked })}
            className="rounded border-gray-300"
          />
          윤달
        </label>
      )}

      {/* 연/월/일 */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">연도</label>
          <select
            value={state.year}
            onChange={(e) => update({ year: e.target.value ? Number(e.target.value) : '', day: '' })}
            className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">선택</option>
            {Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, i) => CURRENT_YEAR - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">월</label>
          <select
            value={state.month}
            onChange={(e) => update({ month: e.target.value ? Number(e.target.value) : '', day: '' })}
            className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">선택</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">일</label>
          <select
            value={state.day}
            onChange={(e) => update({ day: e.target.value ? Number(e.target.value) : '' })}
            className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">선택</option>
            {Array.from({ length: getDaysInMonth() }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d}일</option>
            ))}
          </select>
        </div>
      </div>

      {/* 시간 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-500">시간</label>
          <button
            onClick={() => update({ hourMode: state.hourMode === 'sijin' ? 'exact' : 'sijin' })}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {state.hourMode === 'sijin' ? '정확한 시간 >' : '< 시진'}
          </button>
        </div>
        {state.hourMode === 'sijin' ? (
          <select
            value={state.sijinIndex === 'unknown' ? 'unknown' : state.sijinIndex}
            onChange={(e) => {
              const v = e.target.value;
              update({ sijinIndex: v === '' ? '' : v === 'unknown' ? 'unknown' : Number(v) });
            }}
            className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">시간 선택</option>
            {HOUR_LABELS.map((h, i) => (
              <option key={i} value={i}>{h.label} ({h.range})</option>
            ))}
            <option value="unknown">모름</option>
          </select>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <select
              value={state.exactHour}
              onChange={(e) => update({ exactHour: e.target.value ? Number(e.target.value) : '' })}
              className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">시</option>
              {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                <option key={h} value={h}>{h}시</option>
              ))}
            </select>
            <select
              value={state.exactMinute}
              onChange={(e) => update({ exactMinute: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              {[0, 10, 20, 30, 40, 50].map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}분</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 성별 */}
      <div>
        <label className="block text-xs text-gray-500 mb-2">성별</label>
        <div className="flex gap-2">
          {(['M', 'F'] as const).map((g) => (
            <button
              key={g}
              onClick={() => update({ gender: g })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                state.gender === g ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {g === 'M' ? '남성' : '여성'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CompatibilityForm({ onSubmit }: CompatibilityFormProps) {
  const [person1, setPerson1] = useState<PersonState>({ ...initialState });
  const [person2, setPerson2] = useState<PersonState>({ ...initialState });

  const bothComplete = isComplete(person1) && isComplete(person2);

  const handleSubmit = () => {
    if (!bothComplete) return;
    onSubmit(toBirthInput(person1), toBirthInput(person2));
    setTimeout(() => {
      document.getElementById('compat-result-area')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <section id="compat-input-form" className="py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-semibold text-center text-gray-900">궁합 분석</h2>
        <p className="text-sm text-center text-gray-500">두 사람의 생년월일시를 입력하세요</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-gray-50 rounded-xl p-4">
            <PersonInput label="첫 번째 사람" state={person1} onChange={setPerson1} />
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <PersonInput label="두 번째 사람" state={person2} onChange={setPerson2} />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!bothComplete}
          className="w-full py-3 rounded-lg text-base font-semibold transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed bg-pink-600 text-white hover:bg-pink-700 shadow-md hover:shadow-lg"
        >
          궁합 분석하기
        </button>
      </div>
    </section>
  );
}
