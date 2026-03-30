'use client';

import { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import FeatureCards from '@/components/FeatureCards';
import BirthInputForm from '@/components/BirthInputForm';
import SajuResult from '@/components/SajuResult';
import ErrorCard from '@/components/ErrorCard';
import { analyzeSaju } from '@/lib/saju';
import type { BirthInput, SajuAnalysisResult } from '@/lib/saju/types';

export default function Home() {
  const [result, setResult] = useState<SajuAnalysisResult | null>(null);
  const [error, setError] = useState<{ message: string; solution: string } | null>(null);

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

  const handleReset = () => {
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <HeroSection />
      <FeatureCards />
      <BirthInputForm onSubmit={handleSubmit} />

      {result && <SajuResult result={result} onReset={handleReset} />}
      {error && <ErrorCard message={error.message} solution={error.solution} onRetry={handleReset} />}
    </>
  );
}
