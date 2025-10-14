import { useState, useEffect } from 'react';

function CountdownTimer({ endTime }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    if (difference <= 0) return null;

    return {
      أيام: Math.floor(difference / (1000 * 60 * 60 * 24)),
      ساعات: Math.floor((difference / (1000 * 60 * 60)) % 24),
      دقائق: Math.floor((difference / 1000 / 60) % 60),
      ثواني: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    // تحديث المؤقت كل ثانية
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // تنظيف المؤقت عند إزالة المكون
    return () => clearInterval(timer);
  }, [endTime]);

  // حالة انتهاء المزاد
  if (!timeLeft) {
    return (
      <div className="text-center font-bold text-orange-700 p-3 bg-orange-100 rounded-lg">
        انتهى المزاد!
      </div>
    );
  }

  // عرض المؤقت
  return (
    <div className="flex justify-center gap-4 sm:gap-6 text-center">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <span className="font-mono text-2xl sm:text-3xl font-extrabold text-orange-600 tracking-wider">
            {String(value).padStart(2, '0')}
          </span>
          <span className="block text-xs text-gray-500 uppercase mt-1">
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

export default CountdownTimer;
