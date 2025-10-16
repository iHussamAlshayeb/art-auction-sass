import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getMyProfile } from '../services/api';
import Spinner from '../components/Spinner';
import MyArtworksList from '../components/MyArtworksList';
import ActiveBids from '../components/ActiveBids';
import WonArtworks from '../components/WonArtworks';

function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getMyProfile().then(res => setProfile(res.data.user));
  }, []);

  if (!profile) {
    return <Spinner />;
  }

  // 1. التحقق من اكتمال الملف الشخصي للطالب
  const isStudentProfileComplete = profile.schoolName && profile.gradeLevel;

  return (
    <div>
      {/* قسم الترحيب الرئيسي */}
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100 text-center mb-10">
        <h2 className="text-4xl font-extrabold text-orange-600 mb-2 tracking-tight">
          مرحبًا بعودتك، {profile.name}!
        </h2>
        <p className="text-gray-600 text-lg">
          دورك الحالي:
          <span className="font-semibold text-orange-500 mx-1 capitalize">
            {profile.role.toLowerCase()}
          </span>
        </p>
      </div>

      {/* --== بداية المنطق الشرطي ==-- */}

      {/* 2. عرض لوحة تحكم الطالب */}
      {user.role === 'STUDENT' && (
        <>
          {isStudentProfileComplete ? (
            // 3. عرض لوحة التحكم العادية إذا كان الملف الشخصي مكتملاً
            <MyArtworksList />
          ) : (
            // 4. عرض رسالة توجيهية إذا كان الملف الشخصي غير مكتمل
            <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 p-8 rounded-3xl text-center">
              <h3 className="text-2xl font-bold text-yellow-800">خطوتك التالية!</h3>
              <p className="mt-2 text-yellow-700 max-w-lg mx-auto">
                لتحقيق أقصى استفادة من المنصة وعرض أعمالك بشكل احترافي، الرجاء إكمال ملفك الشخصي بإضافة اسم المدرسة والمرحلة الدراسية.
              </p>
              <Link to="/dashboard/profile">
                <button className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all duration-200">
                  إكمال الملف الشخصي الآن
                </button>
              </Link>
            </div>
          )}
        </>
      )}

      {/* عرض لوحة تحكم المشتري (تبقى كما هي) */}
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
      {/* --== نهاية المنطق الشرطي ==-- */}
    </div>
  );
}

export default DashboardPage;