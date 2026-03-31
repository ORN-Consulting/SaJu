'use client';

import { BRAND } from '@/lib/brand';

export default function HeroSection() {
  return (
    <section className="relative py-20 sm:py-28 px-6 text-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          {BRAND.tagline}
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 leading-relaxed">
          전통 명리학에 기반한 사주팔자 분석,<br className="hidden sm:block" />
          지금 바로 무료로 확인하세요.
        </p>
      </div>
    </section>
  );
}
