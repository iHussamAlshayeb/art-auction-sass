import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react'; // 1. استيراد أيقونة الساعة

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
    // تحديث المؤقت كل دقيقة لتحسين الأداء
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(timer);
  }, [endTime]);

  // 2. تحديث التنسيق والألوان
  return (
    <div className={`flex items-center gap-1.5 text-sm font-medium ${timeLeft === 'انتهى المزاد'
        ? 'text-secondary' // اللون البرتقالي المحمر
        : 'text-neutral-700' // اللون المحايد للنصوص
      }`}>
      <Clock size={14} />
      <span>{timeLeft}</span>
    </div>
  );
}

export default AuctionCardTimer;