'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(0);

  useEffect(() => {
    let interval: number | null = null;
    
    if (isActive && seconds > 0) {
      interval = window.setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      alert('타이머가 종료되었습니다!');
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isActive, seconds]);

  const handleStart = () => {
    if (inputMinutes > 0) {
      setSeconds(inputMinutes * 60);
      setIsActive(true);
    }
  };

  const handlePause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
    setInputMinutes(0);
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-4">
      <nav className="bg-white shadow-sm w-full mb-8">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between">
            <div className="text-xl font-bold text-blue-500">
              TimeGom
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/" className="px-4 py-2 rounded-md hover:bg-gray-100">
                시계
              </Link>
              <Link href="/timer" className="px-4 py-2 rounded-md bg-gray-100 font-medium">
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
        <h1 className="text-3xl font-bold mb-8 text-center">타이머</h1>
        
        <div className="text-7xl font-bold text-center mb-8">
          {formatTime(seconds)}
        </div>
        
        {!isActive && seconds === 0 && (
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시간 설정 (분)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={inputMinutes}
              onChange={(e) => setInputMinutes(parseInt(e.target.value) || 0)}
              className="w-24 p-2 border rounded-md"
            />
          </div>
        )}
        
        <div className="flex gap-4">
          {!isActive && seconds === 0 ? (
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium"
              disabled={!inputMinutes}
            >
              시작
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium"
              >
                {isActive ? '일시정지' : '계속'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-green-500 text-white rounded-md font-medium"
              >
                초기화
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
} 