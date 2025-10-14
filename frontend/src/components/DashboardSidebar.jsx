import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// استيراد الأيقونات
import { FiGrid, FiUser, FiLock, FiBriefcase, FiAward, FiTag } from 'react-icons/fi';

function DashboardSidebar() {
    const { user } = useAuth();

    // تنسيق الرابط النشط وغير النشط
    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-lg transition-colors duration-200 font-semibold ${isActive
            ? 'bg-orange-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-orange-100 hover:text-orange-600'
        }`;

    return (
        <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-orange-100 p-4 shrink-0">
            <nav className="space-y-2">
                <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">الرئيسية</h3>
                <NavLink to="/dashboard" end className={linkClass}>
                    <FiGrid />
                    <span>نظرة عامة</span>
                </NavLink>

                <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">إدارة الحساب</h3>
                <NavLink to="/dashboard/profile" className={linkClass}>
                    <FiUser />
                    <span>تعديل الملف الشخصي</span>
                </NavLink>
                <NavLink to="/dashboard/password" className={linkClass}>
                    <FiLock />
                    <span>تغيير كلمة المرور</span>
                </NavLink>

                {/* أقسام خاصة بالأدوار */}
                {user.role === 'STUDENT' && (
                    <>
                        <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">كطالب</h3>
                        <NavLink to="/dashboard/my-artworks" className={linkClass}>
                            <FiBriefcase />
                            <span>أعمالي الفنية</span>
                        </NavLink>
                    </>
                )}

                {user.role === 'BUYER' && (
                    <>
                        <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">كمشتري</h3>
                        <NavLink to="/dashboard/won-auctions" className={linkClass}>
                            <FiAward />
                            <span>مزاداتي الفائزة</span>
                        </NavLink>
                        <NavLink to="/dashboard/active-bids" className={linkClass}>
                            <FiTag />
                            <span>عروضي النشطة</span>
                        </NavLink>
                    </>
                )}
            </nav>
        </aside>
    );
}

export default DashboardSidebar;