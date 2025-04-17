'use client';

import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const date = time.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="clock-display">
        <span>{hours}</span>
        <span className="opacity-75 animate-pulse">:</span>
        <span>{minutes}</span>
        <span className="opacity-75 animate-pulse">:</span>
        <span>{seconds}</span>
      </div>
      <div className="text-xl mt-4 text-gray-600 dark:text-gray-300">
        {date}
      </div>
    </div>
  );
} 