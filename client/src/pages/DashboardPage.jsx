import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getMyProfile } from '../services/api';

// استيراد كل المكونات
import MyArtworksList from '../components/MyArtworksList';
import ActiveBids from '../components/ActiveBids';
import WonArtworks from '../components/WonArtworks';
import ProfileEditor from '../components/ProfileEditor';
import PasswordEditor from '../components/PasswordEditor';

function DashboardPage() {
  const { user } = useAuth(); // للحصول على الدور بسرعة
  const [profile, setProfile] = useState(null); // لتخزين بيانات الملف الشخصي الكاملة

  useEffect(() => {
    // جلب بيانات الملف الشخصي الكاملة عند تحميل الصفحة
    getMyProfile().then(res => setProfile(res.data.user));
  }, []);

  // عرض رسالة تحميل ريثما تصل البيانات
  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-500">جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-6 sm:px-10 bg-gradient-to-b from-orange-50 via-white to-orange-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* قسم الترحيب الرئيسي */}
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100 text-center">
          <h2 className="text-4xl font-extrabold text-orange-600 mb-2 tracking-tight">
            مرحبًا، {profile.name}!
          </h2>
          <p className="text-gray-600 text-lg">
            دورك الحالي:
            <span className="font-semibold text-orange-500 mx-1 capitalize">
              {profile.role.toLowerCase()}
            </span>
          </p>
        </div>

        {/* عرض لوحة التحكم الخاصة بالدور */}
        {user.role === 'STUDENT' && (
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100 space-y-6 transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-2xl font-bold text-gray-800">إجراءات الطالب</h3>
              <Link to="/artworks/new">
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all duration-200">
                  + إضافة عمل فني جديد
                </button>
              </Link>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <MyArtworksList />
            </div>
          </div>
        )}

        {user.role === 'BUYER' && (
          <div className="space-y-8">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100 transition-all duration-300 hover:shadow-xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b border-orange-100 pb-3">
                الأعمال الفنية التي فزت بها
              </h3>
              <WonArtworks />
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100 transition-all duration-300 hover:shadow-xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b border-orange-100 pb-3">
                عروضك النشطة
              </h3>
              <ActiveBids />
            </div>
          </div>
        )}

        {/* قسم إدارة الحساب (يظهر للجميع) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">تعديل الملف الشخصي</h3>
            <ProfileEditor user={profile} />
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">تغيير كلمة المرور</h3>
            <PasswordEditor />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;