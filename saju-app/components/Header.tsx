'use client';

import { BRAND } from '@/lib/brand';

export default function Header() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 text-lg font-bold text-gray-900 hover:text-gray-700 transition-colors"
        >
          <span>{BRAND.emoji}</span>
          <span>{BRAND.name}</span>
        </button>

        <nav className="flex items-center gap-6 text-sm text-gray-600">
          <button
            onClick={() => scrollTo('features')}
            className="hover:text-gray-900 transition-colors"
          >
            소개
          </button>
          <button
            onClick={() => scrollTo('input-form')}
            className="hover:text-gray-900 transition-colors"
          >
            분석하기
          </button>
        </nav>
      </div>
    </header>
  );
}
