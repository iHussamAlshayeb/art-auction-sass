import { useState, useEffect } from 'react';
import { getAdminStats, getAllUsers } from '../services/api';

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([getAdminStats(), getAllUsers()]);
        setStats(statsRes.data);
        setUsers(usersRes.data.users);
      } catch (error) {
        console.error("Failed to load admin data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <p className="text-center p-10">جاري تحميل لوحة تحكم المسؤول...</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-800">لوحة تحكم المسؤول</h1>
      
      {/* قسم الإحصائيات */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600">إجمالي المستخدمين</p>
            <p className="text-3xl font-bold">{stats.users}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600">المزادات النشطة</p>
            <p className="text-3xl font-bold">{stats.activeAuctions}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600">إجمالي الإيرادات</p>
            <p className="text-3xl font-bold">{stats.totalRevenue.toFixed(2)} ريال</p>
          </div>
        </div>
      )}

      {/* جدول المستخدمين */}
       <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">إدارة المستخدمين</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 border-b">الاسم</th>
                <th className="py-3 px-4 border-b">البريد الإلكتروني</th>
                <th className="py-3 px-4 border-b">الدور</th>
                <th className="py-3 px-4 border-b">تاريخ الانضمام</th>
              </tr>
            </thead>
             <tbody>
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">{user.name}</td>
                  <td className="py-3 px-4 border-b">{user.email}</td>
                  <td className="py-3 px-4 border-b">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">{new Date(user.createdAt).toLocaleDateString()}</td>
                   <td className="py-3 px-4 border-b">
                    {/* لا تسمح للمسؤول بحذف نفسه */}
                    {user.id !== adminUser.id && (
                      <div className="flex gap-2">
                        <select 
                          value={user.role} 
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-xs p-1 border rounded"
                        >
                          <option value="BUYER">BUYER</option>
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