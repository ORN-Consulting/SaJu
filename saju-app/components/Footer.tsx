import { BRAND } from '@/lib/brand';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-8 mt-16">
      <div className="max-w-5xl mx-auto px-6 text-center text-sm text-gray-500 space-y-1.5">
        <p>
          {BRAND.copyright} |{' '}
          <a
            href={`https://${BRAND.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 underline underline-offset-2 transition-colors"
          >
            {BRAND.website}
          </a>
        </p>
        <p>{BRAND.subtitle}</p>
        <p className="whitespace-pre-line">{BRAND.disclaimer}</p>
      </div>
    </footer>
  );
}
