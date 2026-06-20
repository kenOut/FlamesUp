import { useEffect, useState } from 'react';

const DAY_START_HOUR = 6;
const DAY_END_HOUR = 18;

function isDaytime() {
  const hour = new Date().getHours();
  return hour >= DAY_START_HOUR && hour < DAY_END_HOUR;
}

export default function useDayNight() {
  const [isDay, setIsDay] = useState(isDaytime);

  useEffect(() => {
    const timer = setInterval(() => setIsDay(isDaytime()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return isDay;
}
