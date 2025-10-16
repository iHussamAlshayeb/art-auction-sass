import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiGrid, FiSearch, FiUser } from 'react-icons/fi';

function BottomNav() {
    const { user } = useAuth();

    const linkClass = ({ isActive }) =>
        `flex flex-col items-center gap-1 transition-colors duration-200 ${isActive
            ? 'text-orange-500'
            : 'text-gray-500 hover:text-orange-500'
        }`;

    return (
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

                {/* --== بداية الجزء المُعدل ==-- */}
                {user ? (
                    // إذا كان المستخدم مسجلاً دخوله، اعرض صورته
                    <NavLink to="/dashboard" className={linkClass}>
                        <img
                            src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.name}&background=ffedd5&color=f97316&size=128`}
                            alt={user.name}
                            className="w-7 h-7 rounded-full object-cover border-2 border-gray-300"
                        />
                        <span className="text-xs">حسابي</span>
                    </NavLink>
                ) : (
                    // إذا كان زائرًا، اعرض أيقونة تسجيل الدخول
                    <NavLink to="/login" className={linkClass}>
                        <FiUser size={22} />
                        <span className="text-xs">دخول</span>
                    </NavLink>
                )}
                {/* --== نهاية الجزء المُعدل ==-- */}
            </div>
        </nav>
    );
}

export default BottomNav;