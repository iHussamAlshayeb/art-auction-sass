import { useState, useEffect } from 'react';
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAdminArtworks,
  deleteArtworkByAdmin
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

function AdminDashboardPage() {
  const { user: adminUser } = useAuth(); // إعادة تسمية لتجنب التضارب
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  // دالة لجلب كل البيانات يمكننا استدعاؤها لإعادة التحديث
  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, artworksRes] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getAdminArtworks()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setArtworks(artworksRes.data.artworks);
    } catch (error) {
      console.error("Failed to load admin data", error);
      toast.error("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('هل أنت متأكد من أنك تريد حذف هذا المستخدم نهائيًا؟')) {
      try {
        await deleteUser(userId);
        toast.success('تم حذف المستخدم بنجاح!');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'فشل في حذف المستخدم.');
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success('تم تحديث دور المستخدم!');
      fetchData();
    } catch (error) {
      toast.error('فشل في تغيير دور المستخدم.');
    }
  };

  const handleDeleteArtwork = async (artworkId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العمل الفني؟ سيتم حذف أي مزاد مرتبط به.')) {
      try {
        await deleteArtworkByAdmin(artworkId);
        toast.success('تم حذف العمل الفني بنجاح!');
        fetchData(); // إعادة تحميل كل البيانات
      } catch (error) {
        toast.error(error.response?.data?.message || 'فشل في حذف العمل الفني.');
      }
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-10">
      {/* قسم الإحصائيات */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-orange-100 text-center">
            <p className="text-gray-600">إجمالي المستخدمين</p>
            <p className="text-4xl font-extrabold text-orange-600 mt-2">{stats.users}</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-orange-100 text-center">
            <p className="text-gray-600">المزادات النشطة</p>
            <p className="text-4xl font-extrabold text-orange-600 mt-2">{stats.activeAuctions}</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-orange-100 text-center">
            <p className="text-gray-600">إجمالي الإيرادات</p>
            <p className="text-4xl font-extrabold text-orange-600 mt-2">{stats.totalRevenue.toFixed(2)} ريال</p>
          </div>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">إدارة الأعمال الفنية</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-left">
            <thead className="bg-orange-50/50">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">الصورة</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">العنوان</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">الفنان (الطالب)</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">الحالة</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {artworks.map(artwork => (
                <tr key={artwork.id} className="hover:bg-orange-50/30 border-b border-orange-100">
                  <td className="py-2 px-4">
                    <img src={artwork.imageUrl} alt={artwork.title} className="h-12 w-12 object-cover rounded-md" />
                  </td>
                  <td className="py-2 px-4 font-medium">{artwork.title}</td>
                  <td className="py-2 px-4 text-sm text-gray-600">{artwork.student.name}</td>
                  <td className="py-2 px-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {artwork.status}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleDeleteArtwork(artwork.id)}
                      className="text-red-600 hover:text-red-900 text-xs font-semibold"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* قسم إدارة المستخدمين */}
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">إدارة المستخدمين</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-left">
            <thead className="bg-orange-50/50">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">الاسم</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">البريد الإلكتروني</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">الدور</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">تاريخ الانضمام</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="hover:bg-orange-50/30 border-b border-orange-100">
                  <td className="py-3 px-4">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'STUDENT' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('ar-SA')}</td>
                  <td className="py-3 px-4">
                    {user.id !== adminUser.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-xs p-1.5 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 text-xs font-semibold"
                        >
                          حذف
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">لا يمكن التعديل</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
