'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [inputHours, setInputHours] = useState(0);
  const [inputMinutes, setInputMinutes] = useState(0);
  const [inputSeconds, setInputSeconds] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isActive && seconds > 0) {
      intervalId = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      alert('타이머가 종료되었습니다!');
    }

    return () => clearInterval(intervalId);
  }, [isActive, seconds]);

  const handleStart = () => {
    if (inputHours || inputMinutes || inputSeconds) {
      const totalSeconds = (inputHours * 3600) + (inputMinutes * 60) + inputSeconds;
      setSeconds(totalSeconds);
      setIsActive(true);
    }
  };

  const handlePause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
    setInputHours(0);
    setInputMinutes(0);
    setInputSeconds(0);
  };

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const secs = timeInSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container-center flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-3xl font-bold mb-8 text-center">타이머</h1>
        
        <div className="clock-display mb-8">
          {formatTime(seconds)}
        </div>
        
        {!isActive && seconds === 0 && (
          <div className="flex gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                시간
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={inputHours}
                onChange={(e) => setInputHours(parseInt(e.target.value) || 0)}
                className="w-16 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                분
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(parseInt(e.target.value) || 0)}
                className="w-16 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                초
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={inputSeconds}
                onChange={(e) => setInputSeconds(parseInt(e.target.value) || 0)}
                className="w-16 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
        )}
        
        <div className="flex gap-4">
          {!isActive && seconds === 0 ? (
            <button
              onClick={handleStart}
              className="btn btn-primary"
              disabled={!inputHours && !inputMinutes && !inputSeconds}
            >
              시작
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                className="btn btn-primary"
              >
                {isActive ? '일시정지' : '계속'}
              </button>
              <button
                onClick={handleReset}
                className="btn btn-secondary"
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