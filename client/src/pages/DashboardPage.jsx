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
  const { user: authUser } = useAuth(); // المستخدم من سياق المصادقة
  const [profile, setProfile] = useState(null); // بيانات الملف الشخصي الكاملة

  useEffect(() => {
    // جلب بيانات الملف الشخصي الكاملة عند تحميل الصفحة
    getMyProfile().then(res => setProfile(res.data.user));
  }, []);

  if (!profile) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* قسم الترحيب الرئيسي */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-gray-800">Welcome, {profile.name}!</h2>
        <p className="text-gray-600 mt-2">
          Your role is: <span className="font-semibold text-indigo-600 capitalize">{profile.role.toLowerCase()}</span>
        </p>
      </div>

      {/* عرض لوحة التحكم الخاصة بالدور */}
      {authUser.role === 'STUDENT' && (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-800">Student Actions</h3>
            <Link to="/artworks/new">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                + Add New Artwork
              </button>
            </Link>
          </div>
          <MyArtworksList />
        </div>
      )}

      {authUser.role === 'BUYER' && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md"><WonArtworks /></div>
          <div className="bg-white p-6 rounded-lg shadow-md"><ActiveBids /></div>
        </div>
      )}

      {/* قسم إدارة الحساب (يظهر للجميع) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Edit Profile</h3>
          <ProfileEditor user={profile} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Change Password</h3>
          <PasswordEditor />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;