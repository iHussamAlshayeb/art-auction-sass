import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, Image, Users, LayoutDashboard, Shield, LogIn, UserPlus, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

const MobileMenu = ({ isOpen, setIsOpen }) => {
    const { user } = useAuth();
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (menu) => {
        setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
    };

    const navLinks = [
        { to: "/", label: "الرئيسية", icon: <Home size={20} /> },
        { to: "/gallery", label: "المعرض", icon: <Image size={20} /> },
        { to: "/artists", label: "الفنانون", icon: <Users size={20} /> },
    ];

    const dashboardSubmenu = [
        { to: "/dashboard", label: "نظرة عامة", end: true },
        { to: "/dashboard/profile", label: "تعديل الملف الشخصي" },
        { to: "/dashboard/password", label: "تغيير كلمة المرور" },
    ];
    const studentSubmenu = [{ to: "/dashboard/my-artworks", label: "أعمالي الفنية" }];
    const buyerSubmenu = [
        { to: "/dashboard/won-auctions", label: "مزاداتي الفائزة" },
        { to: "/dashboard/active-bids", label: "عروضي النشطة" },
    ];

    const linkClass = ({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-lg text-md font-medium transition-all ${isActive ? "bg-orange-100 text-orange-600" : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"}`;
    const closeMenu = () => setIsOpen(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={closeMenu} />
                    <motion.aside initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }} transition={{ type: "tween", duration: 0.3 }} className="md:hidden flex flex-col w-72 bg-white shadow-lg fixed right-0 top-0 bottom-0 z-50">
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center p-4 border-b">
                                <span className="font-bold text-lg">القائمة</span>
                                <button onClick={closeMenu} className="p-2 rounded-md hover:bg-gray-100"><X size={20} /></button>
                            </div>

                            <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
                                {navLinks.map(({ to, label, icon }) => (
                                    <NavLink key={to} to={to} end={to === "/"} onClick={closeMenu} className={linkClass}>{icon}<span>{label}</span></NavLink>
                                ))}

                                {user && (
                                    <div>
                                        <button onClick={() => toggleMenu("dashboard")} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-md font-medium transition-all ${location.pathname.startsWith("/dashboard") ? "bg-orange-100 text-orange-600" : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"}`}>
                                            <div className="flex items-center gap-4"><LayoutDashboard size={20} /><span>لوحة التحكم</span></div>
                                            <ChevronDown size={18} className={`transition-transform ${openMenus["dashboard"] ? "rotate-180" : ""}`} />
                                        </button>
                                        <AnimatePresence>
                                            {openMenus["dashboard"] && (
                                                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden mr-4 mt-1 space-y-1 border-r-2 border-orange-100">
                                                    {dashboardSubmenu.map((item) => (<NavLink key={item.to} to={item.to} end={item.end} onClick={closeMenu} className={({ isActive }) => `block pl-8 pr-4 py-2 rounded-md text-sm transition-all ${isActive ? "text-orange-600 font-medium" : "text-gray-600 hover:text-orange-500"}`}>{item.label}</NavLink>))}
                                                    {user.role === 'STUDENT' && studentSubmenu.map((item) => (<NavLink key={item.to} to={item.to} onClick={closeMenu} className={({ isActive }) => `block pl-8 pr-4 py-2 rounded-md text-sm transition-all ${isActive ? "text-orange-600 font-medium" : "text-gray-600 hover:text-orange-500"}`}>{item.label}</NavLink>))}
                                                    {user.role === 'BUYER' && buyerSubmenu.map((item) => (<NavLink key={item.to} to={item.to} onClick={closeMenu} className={({ isActive }) => `block pl-8 pr-4 py-2 rounded-md text-sm transition-all ${isActive ? "text-orange-600 font-medium" : "text-gray-600 hover:text-orange-500"}`}>{item.label}</NavLink>))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {user?.role === "ADMIN" && (
                                    <NavLink to="/admin" onClick={closeMenu} className={({ isActive }) => `${linkClass({ isActive })} ${isActive ? 'bg-red-100 !text-red-600' : 'text-red-600 hover:!bg-red-50'}`}><Shield size={20} /><span>لوحة الإدارة</span></NavLink>
                                )}
                            </nav>

                            <div className="border-t p-4">
                                {user ? (
                                    <div onClick={closeMenu}><LogoutButton /></div>
                                ) : (
                                    // === تم إعادة إضافة هذا الجزء ===
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