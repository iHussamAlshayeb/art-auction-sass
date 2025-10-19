import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiGrid, FiPlus, FiBell } from 'react-icons/fi'; // 1. استيراد أيقونة الجرس
import { MdOutlineDesignServices } from "react-icons/md";

function BottomNav() {
    const { user } = useAuth();

    const linkClass = ({ isActive }) =>
        `flex flex-col items-center justify-center gap-1 w-full transition-colors duration-200 ${isActive
            ? 'text-orange-500'
            : 'text-gray-500 hover:text-orange-500'
        }`;

    // تخطيط خاص بالطلاب
    if (user && user.role === 'STUDENT') {
        return (
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-40 border-t border-orange-100">
                <div className="flex justify-around items-center h-full relative">
                    <NavLink to="/gallery" className={linkClass}>
                        <FiGrid size={22} />
                        <span className="text-xs">المعرض</span>
                    </NavLink>
                    <NavLink to="/artists" className={linkClass}>
                        <MdOutlineDesignServices size={22} />
                        <span className="text-xs">الفنانون</span>
                    </NavLink>
                    <div className="w-16"></div> {/* عنصر وهمي للمساحة */}
                    <Link
                        to="/artworks/new"
                        className="absolute left-1/2 -translate-x-1/2 -top-8 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white z-50"
                    >
                        <FiPlus size={28} />
                    </Link>

                    {/* 2. استبدال "حسابي" بـ "الإشعارات" */}
                    <NavLink to="/notifications" className={linkClass}>
                        <FiBell size={22} />
                        <span className="text-xs">الإشعارات</span>
                    </NavLink>
                    {/* تم حذف زر الرئيسية */}
                </div>
            </nav>
        );
    }

    // التخطيط الافتراضي (للمشترين والزوار)
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 border-t border-orange-100">
            <div className="flex justify-around items-center h-16">
                <NavLink to="/gallery" className={linkClass}>
                    <FiGrid size={22} />
                    <span className="text-xs">المعرض</span>
                </NavLink>
                <NavLink to="/artists" className={linkClass}>
                    <MdOutlineDesignServices size={22} />
                    <span className="text-xs">الفنانون</span>
                </NavLink>
                {/* 3. استبدال "حسابي" بـ "الإشعارات" */}
                <NavLink to="/notifications" className={linkClass}>
                    <FiBell size={22} />
                    <span className="text-xs">الإشعارات</span>
                </NavLink>
                {/* تم حذف زر الرئيسية */}
            </div>
        </nav>
    );
}

export default BottomNav;