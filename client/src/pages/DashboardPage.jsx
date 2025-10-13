import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import MyArtworksList from '../components/MyArtworksList';
import ActiveBids from '../components/ActiveBids';
import WonArtworks from '../components/WonArtworks';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="pt-28 pb-20 px-6 sm:px-10 bg-gradient-to-b from-orange-50 via-white to-orange-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* رأس الصفحة */}
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100">
          <h2 className="text-4xl font-extrabold text-orange-600 mb-2 tracking-tight">
            لوحة التحكم
          </h2>
          <p className="text-gray-600 text-lg">
            مرحبًا بعودتك! دورك الحالي:
            <span className="font-semibold text-orange-500 mx-1 capitalize">
              {user.role.toLowerCase()}
            </span>
          </p>
        </div>

        {/* عرض الطالب */}
        {user.role === 'STUDENT' && (
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100 space-y-6 transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-2xl font-bold text-gray-800">
                إجراءات الطالب
              </h3>
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

        {/* عرض المشتري */}
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
                العروض النشطة
              </h3>
              <ActiveBids />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
