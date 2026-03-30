import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '사주풀이 - 무료 사주 분석',
  description: '전통 명리학에 기반한 무료 사주팔자 분석. 회원가입 없이 생년월일시만 입력하면 오행, 십성, 용신을 바로 확인할 수 있습니다.',
  keywords: '사주, 사주팔자, 명리학, 오행, 십성, 용신, 무료 사주',
  openGraph: {
    title: '사주풀이 - 무료 사주 분석',
    description: '전통 명리학 기반 사주팔자 분석, 지금 바로 무료로 확인하세요.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} font-sans antialiased bg-white text-gray-900`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
