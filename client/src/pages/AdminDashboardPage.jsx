import { useState, useEffect } from 'react';
import { getAdminStats, getAllUsers } from '../services/api';

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await getAdminStats();
        const usersRes = await getAllUsers();
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

  if (loading) return <p>Loading admin dashboard...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>

      {/* قسم الإحصائيات */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-gray-600">Total Users</p><p className="text-3xl font-bold">{stats.users}</p></div>
          <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-gray-600">Active Auctions</p><p className="text-3xl font-bold">{stats.activeAuctions}</p></div>
          <div className="bg-white p-6 rounded-lg shadow-md"><p className="text-gray-600">Total Revenue</p><p className="text-3xl font-bold">{stats.totalRevenue} SAR</p></div>
        </div>
      )}

      {/* قسم المستخدمين */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Role</th>
                <th className="py-2 px-4 border-b">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">{user.role}</td>
                  <td className="py-2 px-4 border-b">{new Date(user.createdAt).toLocaleDateString()}</td>
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