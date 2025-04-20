'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function IntervalTimer() {
  const [workTime, setWorkTime] = useState(25);
  const [restTime, setRestTime] = useState(5);
  const [rounds, setRounds] = useState(4);
  const [currentRound, setCurrentRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prevTime: number) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (isWorkPhase) {
        // 휴식 시간으로 전환
        setIsWorkPhase(false);
        setTimeLeft(restTime * 60);
      } else {
        // 다음 라운드로 전환 또는 종료
        if (currentRound < rounds - 1) {
          setCurrentRound((prevRound: number) => prevRound + 1);
          setIsWorkPhase(true);
          setTimeLeft(workTime * 60);
        } else {
          // 모든 라운드 완료
          setIsActive(false);
          alert('인터벌 타이머가 완료되었습니다!');
        }
      }
    }

    return () => clearInterval(intervalId);
  }, [isActive, timeLeft, isWorkPhase, workTime, restTime, currentRound, rounds]);

  const handleStart = () => {
    if (!isActive) {
      setCurrentRound(0);
      setIsWorkPhase(true);
      setTimeLeft(workTime * 60);
      setIsActive(true);
    }
  };

  const handlePause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentRound(0);
    setIsWorkPhase(true);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container-center flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8 text-center">인터벌 타이머</h1>
        
        {!isActive && timeLeft === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                운동 시간 (분)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={workTime}
                onChange={(e) => setWorkTime(parseInt(e.target.value) || 1)}
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                휴식 시간 (분)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={restTime}
                onChange={(e) => setRestTime(parseInt(e.target.value) || 1)}
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                반복 횟수
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value) || 1)}
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-semibold mb-4">
              {isWorkPhase ? '운동 중' : '휴식 중'} - 라운드 {currentRound + 1}/{rounds}
            </div>
            <div className="clock-display mb-8">
              {formatTime(timeLeft)}
            </div>
            <div className="w-full max-w-md h-2 mb-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${isWorkPhase ? 'bg-primary' : 'bg-secondary'}`}
                style={{
                  width: `${isWorkPhase
                    ? (timeLeft / (workTime * 60)) * 100
                    : (timeLeft / (restTime * 60)) * 100}%`
                }}
              />
            </div>
          </>
        )}
        
        <div className="flex gap-4">
          {!isActive && timeLeft === 0 ? (
            <button
              onClick={handleStart}
              className="btn btn-primary"
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