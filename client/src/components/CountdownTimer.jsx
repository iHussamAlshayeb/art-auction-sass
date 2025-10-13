import { useState, useEffect } from 'react';

function CountdownTimer({ endTime }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (!timeLeft) {
    return (
      <div className="text-center font-bold text-red-600 p-2 bg-red-100 rounded-lg">
        Auction Has Ended!
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-4 text-center">
      <div>
        <span className="font-mono text-2xl md:text-3xl font-bold text-gray-800">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="block text-xs text-gray-500">Days</span>
      </div>
      <div>
        <span className="font-mono text-2xl md:text-3xl font-bold text-gray-800">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="block text-xs text-gray-500">Hours</span>
      </div>
      <div>
        <span className="font-mono text-2xl md:text-3xl font-bold text-gray-800">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="block text-xs text-gray-500">Mins</span>
      </div>
      <div>
        <span className="font-mono text-2xl md:text-3xl font-bold text-gray-800">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="block text-xs text-gray-500">Secs</span>
      </div>
    </div>
  );
}

export default CountdownTimer;