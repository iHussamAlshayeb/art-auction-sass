import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiUser, FiLock, FiBriefcase, FiAward, FiTag, FiShield, FiX } from 'react-icons/fi';

function DashboardSidebar({ isOpen, setIsOpen }) {
    const { user } = useAuth();

    // دالة لتنسيق الرابط النشط وغير النشط
    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-lg transition-colors duration-200 font-semibold ${isActive
            ? 'bg-orange-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-orange-100 hover:text-orange-600'
        }`;

    // دالة لإغلاق القائمة عند النقر على رابط (مهم للشاشات الصغيرة)
    const handleLinkClick = () => {
        if (window.innerWidth < 768) { // 768px هو breakpoint 'md'
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* خلفية معتمة تظهر فقط على الجوال عند فتح القائمة */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white/80 backdrop-blur-sm border-r border-orange-100 p-4 z-20 transform transition-transform duration-300 ease-in-out 
                  ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                  md:translate-x-0 md:static`}
            >
                <div className="flex justify-between items-center mb-6 md:hidden">
                    <span className="font-bold text-lg">القائمة</span>
                    <button onClick={() => setIsOpen(false)} aria-label="Close menu">
                        <FiX size={24} />
                    </button>
                </div>

                <nav className="space-y-2">
                    <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">الرئيسية</h3>
                    <NavLink to="/dashboard" end className={linkClass} onClick={handleLinkClick}>
                        <FiGrid /> <span>نظرة عامة</span>
                    </NavLink>

                    <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">إدارة الحساب</h3>
                    <NavLink to="/dashboard/profile" className={linkClass} onClick={handleLinkClick}>
                        <FiUser /> <span>تعديل الملف الشخصي</span>
                    </NavLink>
                    <NavLink to="/dashboard/password" className={linkClass} onClick={handleLinkClick}>
                        <FiLock /> <span>تغيير كلمة المرور</span>
                    </NavLink>

                    {/* أقسام خاصة بالأدوار */}
                    {user.role === 'STUDENT' && (
                        <>
                            <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">كطالب</h3>
                            <NavLink to="/dashboard/my-artworks" className={linkClass} onClick={handleLinkClick}>
                                <FiBriefcase />
                                <span>أعمالي الفنية</span>
                            </NavLink>
                        </>
                    )}

                    {user.role === 'BUYER' && (
                        <>
                            <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">كمشتري</h3>
                            <NavLink to="/dashboard/won-auctions" className={linkClass} onClick={handleLinkClick}>
                                <FiAward />
                                <span>مزاداتي الفائزة</span>
                            </NavLink>
                            <NavLink to="/dashboard/active-bids" className={linkClass} onClick={handleLinkClick}>
                                <FiTag />
                                <span>عروضي النشطة</span>
                            </NavLink>
                        </>
                    )}

                    {/* قسم الإدارة (يظهر للمسؤول فقط) */}
                    {user.role === 'ADMIN' && (
                        <>
                            <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-red-400 uppercase tracking-wider">أدوات الإدارة</h3>
                            <NavLink to="/admin" className={linkClass} onClick={handleLinkClick}>
                                <FiShield />
                                <span>لوحة الإدارة</span>
                            </NavLink>
                        </>
                    )}
                </nav>
            </aside>
        </>
    );
}

export default DashboardSidebar;