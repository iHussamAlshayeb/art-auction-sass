import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiSearch, FiGrid, FiUser } from 'react-icons/fi';

function BottomNav() {
    const { user } = useAuth();

    // تنسيق الأيقونة النشطة وغير النشطة
    const linkClass = ({ isActive }) =>
        `flex flex-col items-center gap-1 transition-colors duration-200 ${isActive
            ? 'text-orange-500'
            : 'text-gray-500 hover:text-orange-500'
        }`;

    return (
        // الشريط السفلي الثابت الذي يظهر فقط على الشاشات الصغيرة
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 border-t border-orange-100">
            <div className="flex justify-around items-center h-16">
                <NavLink to="/" end className={linkClass}>
                    <FiHome size={22} />
                    <span className="text-xs">الرئيسية</span>
                </NavLink>
                <NavLink to="/gallery" className={linkClass}>
                    <FiGrid size={22} />
                    <span className="text-xs">المعرض</span>
                </NavLink>
                <NavLink to="/artists" className={linkClass}>
                    <FiSearch size={22} />
                    <span className="text-xs">الفنانون</span>
                </NavLink>
                <NavLink to={user ? "/dashboard" : "/login"} className={linkClass}>
                    <FiUser size={22} />
                    <span className="text-xs">{user ? 'حسابي' : 'دخول'}</span>
                </NavLink>
            </div>
        </nav>
    );
}

export default BottomNav;