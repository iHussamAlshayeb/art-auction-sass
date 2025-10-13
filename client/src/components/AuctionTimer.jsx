import { useState, useEffect } from 'react';

function AuctionTimer({ endTime }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        أيام: Math.floor(difference / (1000 * 60 * 60 * 24)),
        ساعات: Math.floor((difference / (1000 * 60 * 60)) % 24),
        دقائق: Math.floor((difference / 1000 / 60) % 60),
        ثواني: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // تنظيف المؤقت عند مغادرة الصفحة لمنع تسرب الذاكرة
    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && timeLeft[interval] !== 0) {
      return;
    }
    // إضافة صفر للرقم إذا كان أقل من 10
    const value = String(timeLeft[interval]).padStart(2, '0');
    timerComponents.push(
      <div key={interval} className="text-center">
        <div className="text-2xl md:text-4xl font-bold text-gray-800">{value}</div>
        <div className="text-xs text-gray-500 uppercase">{interval}</div>
      </div>
    );
  });

  return (
    <div className="mt-4">
      <h4 className="text-center font-semibold mb-3">ينتهي المزاد خلال</h4>
      {timerComponents.length ? (
        <div className="flex justify-center gap-4 md:gap-8">
            {timerComponents}
        </div>
      ) : (
        <div className="text-center text-xl font-bold text-red-600 p-4 bg-red-100 rounded-lg">
          انتهى المزاد!
        </div>
      )}
    </div>
  );
}

export default AuctionTimer;