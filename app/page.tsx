import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center p-4">
      <nav className="bg-white shadow-sm w-full mb-8">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between">
            <div className="text-xl font-bold text-blue-500">
              TimeGom
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/" className="px-4 py-2 rounded-md bg-gray-100 font-medium">
                시계
              </Link>
              <Link href="/timer" className="px-4 py-2 rounded-md hover:bg-gray-100">
                타이머
              </Link>
              <Link href="/stopwatch" className="px-4 py-2 rounded-md hover:bg-gray-100">
                스톱워치
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto flex flex-col items-center justify-center flex-1">
        <h1 className="text-3xl font-bold mb-8 text-center">현재 시간</h1>
        
        <div className="text-7xl font-bold text-center">
          타이머 사이트에 오신 것을 환영합니다
        </div>
        
        <div className="text-xl mt-4 text-gray-600">
          상단 메뉴에서 원하는 기능을 선택하세요
        </div>

        <div className="mt-8">
          <Link href="/timer" className="px-6 py-3 bg-blue-500 text-white rounded-md font-medium mr-4">
            타이머 시작하기
          </Link>
          <Link href="/stopwatch" className="px-6 py-3 bg-green-500 text-white rounded-md font-medium">
            스톱워치 시작하기
          </Link>
        </div>
      </div>
    </main>
  );
} 