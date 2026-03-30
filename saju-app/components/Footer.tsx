import { BRAND } from '@/lib/brand';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-8 mt-16">
      <div className="max-w-5xl mx-auto px-6 text-center text-sm text-gray-500 space-y-2">
        <p>{BRAND.copyright}. 전통 명리학 기반 사주 분석 서비스.</p>
        <p>{BRAND.disclaimer}</p>
      </div>
    </footer>
  );
}
