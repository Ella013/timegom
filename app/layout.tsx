import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TimeGom - 시간 관리 도구',
  description: '타이머, 스톱워치, 시계를 한 곳에서 사용하세요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-light dark:bg-dark min-h-screen">
        {children}
      </body>
    </html>
  );
} 