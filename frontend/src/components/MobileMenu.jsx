import { NavLink, Link } from "react-router-dom";
import { Home, Image, Users, LayoutDashboard, Shield, LogIn, UserPlus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

const MobileMenu = ({ isOpen, setIsOpen }) => {
    const { user } = useAuth();

    const navLinks = [
        { to: "/", label: "الرئيسية", icon: <Home size={20} /> },
        { to: "/gallery", label: "المعرض", icon: <Image size={20} /> },
        { to: "/artists", label: "الفنانون", icon: <Users size={20} /> },
    ];

    // دالة لتنسيق الروابط
    const linkClass = ({ isActive }) =>
        `flex items-center gap-4 px-4 py-3 rounded-lg text-md font-medium transition-all ${isActive
            ? "bg-orange-100 text-orange-600"
            : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
        }`;

    // دالة لإغلاق القائمة عند النقر على أي رابط
    const closeMenu = () => setIsOpen(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* خلفية معتمة */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={closeMenu}
                    />

                    {/* لوحة القائمة */}
                    <motion.aside
                        initial={{ x: 300 }}
                        animate={{ x: 0 }}
                        exit={{ x: 300 }}
                        transition={{ type: "tween", duration: 0.3 }}
                        className="md:hidden flex flex-col w-72 bg-white shadow-lg fixed right-0 top-0 bottom-0 z-50"
                    >
                        <div className="flex flex-col h-full">
                            {/* رأس القائمة مع زر الإغلاق */}
                            <div className="flex justify-between items-center p-4 border-b">
                                <span className="font-bold text-lg">القائمة</span>
                                <button onClick={closeMenu} className="p-2 rounded-md hover:bg-gray-100">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* روابط التنقل الرئيسية */}
                            <nav className="flex-grow p-4 space-y-2">
                                {navLinks.map(({ to, label, icon }) => (
                                    <NavLink key={to} to={to} end={to === "/"} onClick={closeMenu} className={linkClass}>
                                        {icon}<span>{label}</span>
                                    </NavLink>
                                ))}
                                {user && (
                                    <NavLink to="/dashboard" onClick={closeMenu} className={linkClass}>
                                        <LayoutDashboard size={20} /><span>لوحة التحكم</span>
                                    </NavLink>
                                )}
                                {user?.role === "ADMIN" && (
                                    <NavLink to="/admin" onClick={closeMenu} className={({ isActive }) => `${linkClass({ isActive })} ${isActive ? 'bg-red-100 !text-red-600' : 'text-red-600 hover:!bg-red-50'}`}>
                                        <Shield size={20} /><span>لوحة الإدارة</span>
                                    </NavLink>
                                )}
                            </nav>

                            {/* قسم تسجيل الدخول / الخروج */}
                            <div className="border-t p-4">
                                {user ? (
                                    <div onClick={closeMenu}><LogoutButton /></div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <Link to="/login" onClick={closeMenu} className="flex items-center justify-center gap-2 text-gray-700 hover:text-orange-600 font-medium transition py-2 rounded-lg">
                                            <LogIn size={16} /> تسجيل الدخول
                                        </Link>
                                        <Link to="/register" onClick={closeMenu} className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-full text-center shadow-md transition-all">
                                            <UserPlus size={16} /> إنشاء حساب
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileMenu;