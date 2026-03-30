'use client';

import { useState, useCallback } from 'react';
import type { BirthInput, Gender } from '@/lib/saju/types';
import { HOUR_LABELS } from '@/lib/saju/constants';

interface BirthInputFormProps {
  onSubmit: (input: BirthInput) => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const START_YEAR = 1920;

export default function BirthInputForm({ onSubmit }: BirthInputFormProps) {
  const [isLunar, setIsLunar] = useState(false);
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [year, setYear] = useState<number | ''>('');
  const [month, setMonth] = useState<number | ''>('');
  const [day, setDay] = useState<number | ''>('');
  const [hourMode, setHourMode] = useState<'sijin' | 'exact'>('sijin');
  const [sijinIndex, setSijinIndex] = useState<number | '' | 'unknown'>('');
  const [exactHour, setExactHour] = useState<number | ''>('');
  const [exactMinute, setExactMinute] = useState<number>(0);
  const [gender, setGender] = useState<Gender | ''>('');

  // 일수 계산
  const getDaysInMonth = useCallback((): number => {
    if (!year || !month) return 31;
    if (isLunar) return 30; // 음력은 최대 30일로 간주 (서버 검증 시 정확히 처리)
    return new Date(year as number, month as number, 0).getDate();
  }, [year, month, isLunar]);

  // 시간 결정
  const getHour = (): number | null => {
    if (hourMode === 'sijin') {
      if (sijinIndex === 'unknown') return null;
      if (sijinIndex === '') return null;
      // 시진 인덱스 → 대표 시간 (시진 중앙값)
      const hourMap = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
      return hourMap[sijinIndex as number];
    }
    if (exactHour === '') return null;
    return exactHour as number;
  };

  const isComplete =
    year !== '' &&
    month !== '' &&
    day !== '' &&
    (hourMode === 'sijin' ? sijinIndex !== '' : exactHour !== '') &&
    gender !== '';

  const handleSubmit = () => {
    if (!isComplete) return;

    const hour = getHour();
    onSubmit({
      year: year as number,
      month: month as number,
      day: day as number,
      hour,
      minute: hourMode === 'exact' ? exactMinute : 0,
      isLunar,
      isLeapMonth: isLunar ? isLeapMonth : false,
      gender: gender as Gender,
    });

    // 결과 영역으로 스크롤
    setTimeout(() => {
      document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <section id="input-form" className="py-12 px-6">
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-semibold text-center text-gray-900">사주 분석</h2>

        {/* 양력/음력 */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => { setIsLunar(false); setIsLeapMonth(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !isLunar ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            양력
          </button>
          <button
            onClick={() => setIsLunar(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isLunar ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            음력
          </button>
        </div>
        {isLunar && (
          <label className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isLeapMonth}
              onChange={(e) => setIsLeapMonth(e.target.checked)}
              className="rounded border-gray-300"
            />
            윤달
          </label>
        )}

        {/* 연/월/일 */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">연도</label>
            <select
              value={year}
              onChange={(e) => { setYear(e.target.value ? Number(e.target.value) : ''); setDay(''); }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">선택</option>
              {Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, i) => CURRENT_YEAR - i).map(y => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">월</label>
            <select
              value={month}
              onChange={(e) => { setMonth(e.target.value ? Number(e.target.value) : ''); setDay(''); }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">선택</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">일</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">선택</option>
              {Array.from({ length: getDaysInMonth() }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{d}일</option>
              ))}
            </select>
          </div>
        </div>

        {/* 생시 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-500">시간</label>
            <button
              onClick={() => setHourMode(hourMode === 'sijin' ? 'exact' : 'sijin')}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {hourMode === 'sijin' ? '정확한 시간을 알고 있어요 >' : '< 시진으로 선택하기'}
            </button>
          </div>

          {hourMode === 'sijin' ? (
            <select
              value={sijinIndex === 'unknown' ? 'unknown' : sijinIndex}
              onChange={(e) => {
                const v = e.target.value;
                setSijinIndex(v === '' ? '' : v === 'unknown' ? 'unknown' : Number(v));
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">시간 선택</option>
              {HOUR_LABELS.map((h, i) => (
                <option key={i} value={i}>{h.label} ({h.range})</option>
              ))}
              <option value="unknown">모름 (시주 제외 분석)</option>
            </select>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <select
                value={exactHour}
                onChange={(e) => setExactHour(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">시</option>
                {Array.from({ length: 24 }, (_, i) => i).map(h => (
                  <option key={h} value={h}>{h}시</option>
                ))}
              </select>
              <select
                value={exactMinute}
                onChange={(e) => setExactMinute(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                {[0, 10, 20, 30, 40, 50].map(m => (
                  <option key={m} value={m}>{String(m).padStart(2, '0')}분</option>
                ))}
              </select>
            </div>
          )}

          {sijinIndex === 'unknown' && hourMode === 'sijin' && (
            <p className="mt-2 text-xs text-gray-400">
              태어난 시간을 모르면 년·월·일 기준으로 분석해요. 시주(時柱)는 결과에서 제외돼요.
            </p>
          )}
        </div>

        {/* 성별 */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">성별</label>
          <div className="flex gap-3">
            {(['M', 'F'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  gender === g
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {g === 'M' ? '남성' : '여성'}
              </button>
            ))}
          </div>
        </div>

        {/* 분석 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className="w-full py-3 rounded-lg text-base font-semibold transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg"
        >
          사주 분석하기
        </button>
      </div>
    </section>
  );
}
