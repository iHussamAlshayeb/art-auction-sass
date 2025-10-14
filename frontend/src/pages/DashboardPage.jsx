import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../services/api';
import { useState, useEffect } from 'react';

function DashboardPage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getMyProfile().then(res => setProfile(res.data.user));
  }, []);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100">
      <h2 className="text-3xl font-bold text-orange-600">نظرة عامة</h2>
      <p className="mt-4 text-lg text-gray-700">
        مرحبًا بعودتك، {profile.name}!
      </p>
      <p className="mt-2 text-gray-500">
        استخدم القائمة الجانبية للتنقل بين أقسام لوحة التحكم الخاصة بك.
      </p>
    </div>
  );
}

export default DashboardPage;