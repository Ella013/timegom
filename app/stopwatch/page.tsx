'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    let interval: number | null = null;
    
    if (isRunning) {
      interval = window.setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    setLaps([...laps, time]);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
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
              <Link href="/timer" className="px-4 py-2 rounded-md hover:bg-gray-100">
                타이머
              </Link>
              <Link href="/stopwatch" className="px-4 py-2 rounded-md bg-gray-100 font-medium">
                스톱워치
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto flex flex-col items-center justify-center flex-1">
        <h1 className="text-3xl font-bold mb-8 text-center">스톱워치</h1>
        
        <div className="text-7xl font-bold text-center mb-8">
          {formatTime(time)}
        </div>
        
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleStartStop}
            className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium"
          >
            {isRunning ? '정지' : '시작'}
          </button>
          
          <button
            onClick={handleLap}
            className="px-4 py-2 bg-green-500 text-white rounded-md font-medium"
            disabled={!isRunning}
          >
            랩 기록
          </button>
          
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded-md font-medium"
          >
            초기화
          </button>
        </div>
        
        {laps.length > 0 && (
          <div className="w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">랩 타임</h2>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {laps.map((lapTime, index) => (
                  <li key={index} className="px-4 py-3 flex justify-between">
                    <span>랩 {laps.length - index}</span>
                    <span className="font-mono">{formatTime(lapTime)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 