import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiGrid, FiUser, FiPlus } from 'react-icons/fi';
import { MdOutlineDesignServices } from "react-icons/md";

function BottomNav() {
    const { user } = useAuth();

    const linkClass = ({ isActive }) =>
        `flex flex-col items-center gap-1 transition-colors duration-200 w-16 ${isActive
            ? 'text-orange-500'
            : 'text-gray-500 hover:text-orange-500'
        }`;

    // --== تخطيط خاص بالطلاب ==--
    if (user && user.role === 'STUDENT') {
        return (
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-50 border-t border-orange-100">
                <div className="flex justify-around items-center h-full relative">
                    <NavLink to="/" end className={linkClass}>
                        <FiHome size={22} />
                        <span className="text-xs">الرئيسية</span>
                    </NavLink>
                    <NavLink to="/gallery" className={linkClass}>
                        <FiGrid size={22} />
                        <span className="text-xs">المعرض</span>
                    </NavLink>

                    {/* الزر الأوسط العائم */}
                    <Link
                        to="/artworks/new"
                        className="absolute left-1/2 -translate-x-1/2 -top-6 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white"
                    >
                        <FiPlus size={32} />
                    </Link>

                    <NavLink to="/artists" className={linkClass}>
                        <MdOutlineDesignServices size={22} />
                        <span className="text-xs">الفنانون</span>
                    </NavLink>
                    <NavLink to="/dashboard" className={linkClass}>
                        <img
                            src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.name}&background=ffedd5&color=f97316&size=128`}
                            alt={user.name}
                            className="w-7 h-7 rounded-full object-cover border-2 border-gray-300"
                        />
                        <span className="text-xs">حسابي</span>
                    </NavLink>
                </div>
            </nav>
        );
    }

    // --== التخطيط الافتراضي (للمشترين والزوار) ==--
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
                {user ? (
                    <NavLink to="/dashboard/profile" className={linkClass}>
                        <img
                            src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.name}&background=ffedd5&color=f97316&size=128`}
                            alt={user.name}
                            className="w-7 h-7 rounded-full object-cover border-2 border-gray-300"
                        />
                        <span className="text-xs">حسابي</span>
                    </NavLink>
                ) : (
                    <NavLink to="/login" className={linkClass}>
                        <FiUser size={22} />
                        <span className="text-xs">دخول</span>
                    </NavLink>
                )}
            </div>
        </nav>
    );
}

export default BottomNav;
