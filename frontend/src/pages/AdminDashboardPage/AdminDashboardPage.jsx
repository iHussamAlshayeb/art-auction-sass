// src/pages/AdminDashboardPage.jsx
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAdminArtworks,
  deleteArtworkByAdmin,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';

import './AdminDashboardPage.css'

// ⚡ أنشئ Socket عميل
const socket = io('https://api.fanan3.com', {
  transports: ['websocket'],
  autoConnect: true,
  auth: () => {
    // أرسل التوكن حتى يسمح السيرفر بالانضمام إلى غرفة admins
    const token = localStorage.getItem('token');
    return { token };
  },
});

function AdminDashboardPage() {
  const { user: adminUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, artworksRes] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getAdminArtworks(),
      ]);

      // يدعم شكلين: {stats: {...}} أو {...} مباشرة
      setStats(statsRes.data.stats || statsRes.data);
      setUsers(usersRes.data.users || []);
      setArtworks(artworksRes.data.artworks || []);
    } catch (error) {
      console.error('Failed to load admin data', error);
      toast.error('فشل في تحميل البيانات الإدارية.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // 🎧 الاستماع لتحديثات المشرفين
    socket.on('admin:update', (payload) => {
      // console.log('SOCKET admin:update', payload);
      switch (payload?.type) {
        case 'ARTWORK_DELETED':
          setArtworks((prev) => prev.filter((a) => (a._id || a.id) !== payload.artworkId));
          toast('🖼️ تم حذف عمل فني', { icon: '⚡' });
          break;
        case 'USER_DELETED':
          setUsers((prev) => prev.filter((u) => (u._id || u.id) !== payload.userId));
          toast('👤 تم حذف مستخدم', { icon: '⚡' });
          break;
        case 'AUCTION_ENDED':
          // نعيد تحميل الإحصائيات فقط
          getAdminStats().then((res) => setStats(res.data.stats || res.data));
          break;
        default:
          break;
      }
    });

    return () => {
      socket.off('admin:update');
    };
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم نهائيًا؟')) {
      try {
        await deleteUser(userId);
        // بقية المشرفين سيُحدّثون عبر socket، وأنت كذلك نحدّث مباشرة
        setUsers((prev) => prev.filter((u) => (u._id || u.id) !== userId));
        toast.success('تم حذف المستخدم بنجاح!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'فشل في حذف المستخدم.');
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success('تم تحديث دور المستخدم!');
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      toast.error('فشل في تغيير دور المستخدم.');
    }
  };

  const handleDeleteArtwork = async (artworkId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العمل الفني؟ سيتم حذف أي مزاد مرتبط به.')) {
      try {
        await deleteArtworkByAdmin(artworkId);
        setArtworks((prev) => prev.filter((a) => (a._id || a.id) !== artworkId));
        toast.success('تم حذف العمل الفني بنجاح!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'فشل في حذف العمل الفني.');
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-12">
      {/* ===== الإحصائيات ===== */}
      {stats && (
        <>
          <h1 className="text-3xl font-bold text-center text-primary-dark">لوحة التحكم الإدارية</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <StatCard label="المستخدمون" value={stats.users} icon="👥" color="bg-teal-50 text-teal-600" />
            <StatCard label="الأعمال الفنية" value={stats.artworks} icon="🎨" color="bg-orange-50 text-orange-600" />
            <StatCard label="المزادات" value={stats.auctions} icon="🔨" color="bg-yellow-50 text-yellow-600" />
            <StatCard label="الأعمال المباعة" value={stats.soldArtworks} icon="🖼️" color="bg-green-50 text-green-600" />
            <StatCard label="الإشعارات" value={stats.notifications} icon="🔔" color="bg-purple-50 text-purple-600" />
            <StatCard
              label="إجمالي الإيرادات"
              value={`${(stats.totalRevenue || 0).toFixed(2)} ر.س`}
              icon="💰"
              color="bg-blue-50 text-blue-600"
            />
          </div>
        </>
      )}

      {/* ===== إدارة الأعمال الفنية ===== */}
      <section className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">إدارة الأعمال الفنية</h2>
        {artworks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-left">
              <thead className="bg-orange-50/50">
                <tr>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">الصورة</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">العنوان</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">الفنان</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">الحالة</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {artworks.map((art) => (
                  <tr key={art._id || art.id} className="hover:bg-orange-50/30 border-b border-orange-100">
                    <td className="py-2 px-4">
                      <img src={art.imageUrl} alt={art.title} className="h-12 w-12 object-cover rounded-md" />
                    </td>
                    <td className="py-2 px-4 font-medium">{art.title}</td>
                    <td className="py-2 px-4 text-sm text-gray-600">{art.student?.name || 'غير معروف'}</td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${art.status === 'SOLD'
                          ? 'bg-green-100 text-green-700'
                          : art.status === 'IN_AUCTION'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                          }`}
                      >
                        {art.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => handleDeleteArtwork(art._id || art.id)}
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
        ) : (
          <p className="text-center text-gray-500">لا توجد أعمال فنية بعد.</p>
        )}
      </section>

      {/* ===== إدارة المستخدمين ===== */}
      <section className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">إدارة المستخدمين</h2>
        {users.length > 0 ? (
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
                {users.map((u) => (
                  <tr key={u._id || u.id} className="hover:bg-orange-50/30 border-b border-orange-100">
                    <td className="py-3 px-4">{u.name}</td>
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${u.role === 'ADMIN'
                          ? 'bg-red-100 text-red-800'
                          : u.role === 'STUDENT'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                          }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="py-3 px-4">
                      {(u._id || u.id) !== adminUser?.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id || u.id, e.target.value)}
                            className="text-xs p-1.5 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <button
                            onClick={() => handleDeleteUser(u._id || u.id)}
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
        ) : (
          <p className="text-center text-gray-500">لا يوجد مستخدمون.</p>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`p-5 rounded-2xl shadow-md text-center border border-white/20 ${color}`}>
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

export default AdminDashboardPage;
