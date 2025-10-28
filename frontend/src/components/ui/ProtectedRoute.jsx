import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children, roles }) {
  const { user, isInitializing } = useAuth(); // <-- 1. احصل على حالة التهيئة

  // 2. إذا كانت عملية التحقق الأولية لم تنتهِ بعد، اعرض شاشة تحميل
  if (isInitializing) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-lg text-gray-500">جاري التحقق من جلسة الدخول...</p>
      </div>
    );
  }

  // 3. الآن بعد انتهاء التحقق، يمكننا اتخاذ القرار بثقة
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;