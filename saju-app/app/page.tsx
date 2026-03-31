'use client';

import { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import FeatureCards from '@/components/FeatureCards';
import BirthInputForm from '@/components/BirthInputForm';
import SajuResult from '@/components/SajuResult';
import ErrorCard from '@/components/ErrorCard';
import CompatibilityForm from '@/components/CompatibilityForm';
import CompatibilityResultView from '@/components/CompatibilityResult';
import { analyzeSaju } from '@/lib/saju';
import { analyzeCompatibility } from '@/lib/saju/compatibility';
import type { BirthInput, SajuAnalysisResult, CompatibilityResult } from '@/lib/saju/types';

type Mode = 'saju' | 'compatibility';

export default function Home() {
  const [mode, setMode] = useState<Mode>('saju');

  // 사주 분석 상태
  const [result, setResult] = useState<SajuAnalysisResult | null>(null);
  const [error, setError] = useState<{ message: string; solution: string } | null>(null);

  // 궁합 분석 상태
  const [compatResult, setCompatResult] = useState<CompatibilityResult | null>(null);
  const [compatError, setCompatError] = useState<{ message: string; solution: string } | null>(null);

  const handleSubmit = (input: BirthInput) => {
    setError(null);
    setResult(null);
    const response = analyzeSaju(input);
    if (response.success) {
      setResult(response);
    } else {
      setError({ message: response.message, solution: response.solution });
    }
  };

  const handleCompatSubmit = (person1Input: BirthInput, person2Input: BirthInput) => {
    setCompatError(null);
    setCompatResult(null);

    const response1 = analyzeSaju(person1Input);
    const response2 = analyzeSaju(person2Input);

    if (!response1.success) {
      setCompatError({ message: `첫 번째 사람: ${response1.message}`, solution: response1.solution });
      return;
    }
    if (!response2.success) {
      setCompatError({ message: `두 번째 사람: ${response2.message}`, solution: response2.solution });
      return;
    }

    const compat = analyzeCompatibility(response1, response2);
    setCompatResult(compat);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setCompatResult(null);
    setCompatError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setResult(null);
    setError(null);
    setCompatResult(null);
    setCompatError(null);
  };

  return (
    <>
      <HeroSection />
      <FeatureCards />

      {/* 모드 탭 */}
      <div className="flex justify-center gap-2 pt-8 px-6">
        <button
          onClick={() => switchMode('saju')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            mode === 'saju'
              ? 'bg-gray-900 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          사주 분석
        </button>
        <button
          onClick={() => switchMode('compatibility')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            mode === 'compatibility'
              ? 'bg-pink-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          궁합 분석
        </button>
      </div>

      {/* 사주 분석 모드 */}
      {mode === 'saju' && (
        <>
          <BirthInputForm onSubmit={handleSubmit} />
          {result && <SajuResult result={result} onReset={handleReset} />}
          {error && <ErrorCard message={error.message} solution={error.solution} onRetry={handleReset} />}
        </>
      )}

      {/* 궁합 분석 모드 */}
      {mode === 'compatibility' && (
        <>
          <CompatibilityForm onSubmit={handleCompatSubmit} />
          {compatResult && <CompatibilityResultView result={compatResult} onReset={handleReset} />}
          {compatError && <ErrorCard message={compatError.message} solution={compatError.solution} onRetry={handleReset} />}
        </>
      )}
    </>
  );
}
