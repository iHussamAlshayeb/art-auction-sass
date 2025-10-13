import { useState, useEffect } from 'react';

function AuctionCardTimer({ endTime }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    if (difference <= 0) return "انتهى المزاد";

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);

    if (days > 0) return `${days}ي ${hours}س متبقية`;
    if (hours > 0) return `${hours}س ${minutes}د متبقية`;
    return `${minutes}د متبقية`;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    // تحديث المؤقت كل دقيقة بدلاً من كل ثانية لتحسين الأداء
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); 

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <span className={`text-sm font-medium ${timeLeft === 'انتهى المزاد' ? 'text-red-500' : 'text-gray-500'}`}>
      {timeLeft}
    </span>
  );
}

export default AuctionCardTimer;