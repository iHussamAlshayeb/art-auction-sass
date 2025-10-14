import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../services/api';
import { useState, useEffect } from 'react';

function DashboardPage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getMyProfile().then(res => setProfile(res.data.user));
  }, []);

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-lg text-gray-500">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100">
      <h2 className="text-3xl font-bold text-orange-600 mb-2">نظرة عامة</h2>
      <p className="mt-4 text-xl text-gray-700">
        مرحبًا بعودتك، <span className="font-semibold">{profile.name}</span>!
      </p>
      <p className="mt-2 text-gray-500">
        استخدم القائمة الجانبية للتنقل بين أقسام لوحة التحكم الخاصة بك وإدارة حسابك وأنشطتك.
      </p>
    </div>
  );
}

export default DashboardPage;