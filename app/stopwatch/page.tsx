'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    let intervalId: number;
    
    if (isRunning) {
      intervalId = window.setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    }

    return () => clearInterval(intervalId);
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
    setLaps((prevLaps) => [...prevLaps, time]);
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
    <main className="min-h-screen">
      <Navbar />
      <div className="container-center flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8 text-center">스톱워치</h1>
        
        <div className="clock-display mb-8">
          {formatTime(time)}
        </div>
        
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleStartStop}
            className="btn btn-primary"
          >
            {isRunning ? '정지' : '시작'}
          </button>
          
          <button
            onClick={handleLap}
            className="btn btn-secondary"
            disabled={!isRunning}
          >
            랩 기록
          </button>
          
          <button
            onClick={handleReset}
            className="btn bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            초기화
          </button>
        </div>
        
        {laps.length > 0 && (
          <div className="w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">랩 타임</h2>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
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