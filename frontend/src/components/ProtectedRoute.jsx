import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    // 1. إذا لم يكن المستخدم مسجلاً دخوله، أعد توجيهه لصفحة الدخول
    return <Navigate to="/login" replace />;
  }

  // 2. إذا كانت الصفحة تتطلب دورًا معينًا والمستخدم لا يملكه، أعد توجيهه
  if (roles && !roles.includes(user.role)) {
    // أعد توجيهه إلى لوحة التحكم الخاصة به، فهو غير مصرح له بالوصول هنا
    return <Navigate to="/dashboard" replace />;
  }

  // 3. إذا كان كل شيء سليمًا، اعرض المحتوى
  return children;
}

export default ProtectedRoute;