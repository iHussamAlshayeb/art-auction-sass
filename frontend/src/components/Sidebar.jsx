import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
    Home, Image, Users, LayoutDashboard, Shield, LogIn, UserPlus, ChevronDown, X,
    User, Lock, Briefcase, Award, Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user } = useAuth();
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (menu) => {
        setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
    };
    const closeMenu = () => setIsOpen(false);

    const navLinks = [
        { to: "/", label: "الرئيسية", icon: <Home size={18} /> },
        { to: "/gallery", label: "المعرض", icon: <Image size={18} /> },
        { to: "/artists", label: "الفنانون", icon: <Users size={18} /> },
    ];

    const dashboardSubmenu = [
        { to: "/dashboard", label: "نظرة عامة", icon: <LayoutDashboard size={16} />, end: true },
        { to: "/dashboard/profile", label: "تعديل الملف الشخصي", icon: <User size={16} /> },
        { to: "/dashboard/password", label: "تغيير كلمة المرور", icon: <Lock size={16} /> },
        { to: "/dashboard/my-artworks", label: "أعمالي الفنية", icon: <Briefcase size={16} /> },
        { to: "/dashboard/won-auctions", label: "مزاداتي الفائزة", icon: <Award size={16} /> },
        { to: "/dashboard/active-bids", label: "عروضي النشطة", icon: <Tag size={16} /> },
    ];
    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
            ? "bg-primary/10 text-primary-dark"
            : "text-neutral-700 hover:bg-primary/5 hover:text-primary-dark"
        }`;

    return (
        <>
            {/* زر فتح الشريط عندما يكون مغلقًا */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="hidden md:flex fixed top-6 right-6 z-40 bg-primary text-white p-2 rounded-md shadow-md hover:bg-primary-dark transition-all"
                >
                    <Menu size={22} />
                </button>
            )}

            {/* ====== الشريط الجانبي ====== */}
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        transition={{ type: "tween", duration: 0.35 }}
                        className="hidden md:flex flex-col w-64 bg-white border-l border-neutral-200 shadow-lg fixed right-0 top-0 bottom-0 z-50"
                    >
                        <div className="flex flex-col h-full">
                            {/* الشعار + زر الإغلاق */}
                            <div className="flex justify-between items-center px-4 py-4 border-b border-neutral-200">
                                <Link to="/" className="flex justify-center w-full">
                                    <img src="/logo.svg" alt="Fanan Logo" className="h-16 transition-all" />
                                </Link>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-md hover:bg-neutral-200 text-neutral-700 hover:text-primary-dark transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* قائمة الروابط */}
                            <nav className="flex flex-col flex-grow p-4 space-y-1 overflow-y-auto">
                                {navLinks.map(({ to, label, icon }) => (
                                    <NavLink key={to} to={to} end={to === "/"} className={linkClass}>
                                        {icon}<span>{label}</span>
                                    </NavLink>
                                ))}

                                {/* لوحة التحكم */}
                                {user && (
                                    <div>
                                        <button onClick={() => toggleMenu("dashboard")} className={`w-full ${linkClass({ isActive: location.pathname.startsWith("/dashboard") })} justify-between`}>
                                            <div className="flex items-center gap-3"><LayoutDashboard size={18} /><span>لوحة التحكم</span></div>
                                            <ChevronDown size={16} className={`transition-transform ${openMenus["dashboard"] ? "rotate-180" : ""}`} />
                                        </button>
                                        <AnimatePresence>
                                            {openMenus["dashboard"] && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mr-4 mt-1 space-y-1 border-r-2 border-primary/20">
                                                    {dashboardSubmenu.map((item) => (
                                                        <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `block pl-8 pr-4 py-1.5 rounded-md text-sm transition-all ${isActive ? "bg-primary/10 text-primary-dark font-medium" : "text-neutral-700 hover:text-primary-dark"}`}>{item.label}</NavLink>
                                                    ))}

                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* لوحة الإدارة */}
                                {user?.role === "ADMIN" && (
                                    <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-secondary/10 text-secondary-dark" : "text-secondary-dark hover:bg-secondary/5"}`}>
                                        <Shield size={18} /><span>لوحة الإدارة</span>
                                    </NavLink>
                                )}
                            </nav>

                            {/* تسجيل الدخول / الخروج */}
                            <div className="border-t border-neutral-200 p-4">
                                {user ? (<LogoutButton />) : (
                                    <div className="flex flex-col gap-2">
                                        <Link to="/login" onClick={closeMenu} className="flex items-center justify-center gap-2 text-neutral-700 hover:text-primary font-medium transition py-2 rounded-lg">
                                            <LogIn size={16} /> تسجيل الدخول
                                        </Link>
                                        <Link to="/register" onClick={closeMenu} className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-semibold py-2 px-5 rounded-full text-center shadow-md transition-all">
                                            <UserPlus size={16} /> إنشاء حساب
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;