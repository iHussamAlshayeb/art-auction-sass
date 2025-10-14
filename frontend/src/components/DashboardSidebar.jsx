import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DashboardSidebar() {
    const { user } = useAuth();

    // تنسيق الرابط النشط وغير النشط
    const linkClass = ({ isActive }) =>
        `block w-full text-left px-4 py-2.5 rounded-lg transition-colors duration-200 ${isActive
            ? 'bg-orange-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-orange-100 hover:text-orange-600'
        }`;

    return (
        <aside className="w-64 bg-white/90 backdrop-blur-sm border-r border-orange-100 p-4 min-h-screen">
            <nav className="space-y-2">
                <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">الرئيسية</h3>
                <NavLink to="/dashboard" end className={linkClass}>نظرة عامة</NavLink>

                <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">إدارة الحساب</h3>
                <NavLink to="/dashboard/profile" className={linkClass}>تعديل الملف الشخصي</NavLink>
                <NavLink to="/dashboard/password" className={linkClass}>تغيير كلمة المرور</NavLink>

                {/* أقسام خاصة بالأدوار */}
                {user.role === 'STUDENT' && (
                    <>
                        <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">كطالب</h3>
                        <NavLink to="/dashboard/my-artworks" className={linkClass}>أعمالي الفنية</NavLink>
                    </>
                )}

                {user.role === 'BUYER' && (
                    <>
                        <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">كمشتري</h3>
                        <NavLink to="/dashboard/won-auctions" className={linkClass}>مزاداتي الفائزة</NavLink>
                        <NavLink to="/dashboard/active-bids" className={linkClass}>عروضي النشطة</NavLink>
                    </>
                )}
            </nav>
        </aside>
    );
}

export default DashboardSidebar;