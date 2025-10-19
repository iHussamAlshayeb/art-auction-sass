import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, Image, Users, LayoutDashboard, Shield, LogIn, UserPlus, ChevronDown, User, Lock, Briefcase, Award, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState({ dashboard: true }); // لوحة التحكم مفتوحة افتراضيًا

    const toggleMenu = (menu) => {
        setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
    };

    const navLinks = [
        { to: "/", label: "الرئيسية", icon: <Home size={18} /> },
        { to: "/gallery", label: "المعرض", icon: <Image size={18} /> },
        { to: "/artists", label: "الفنانون", icon: <Users size={18} /> },
    ];

    // كل روابط لوحة التحكم مجمعة
    const dashboardSubmenu = [
        { to: "/dashboard", label: "نظرة عامة", end: true, icon: <LayoutDashboard size={16} /> },
        { to: "/dashboard/profile", label: "تعديل الملف الشخصي", icon: <User size={16} /> },
        { to: "/dashboard/password", label: "تغيير كلمة المرور", icon: <Lock size={16} /> },
        { to: "/dashboard/my-artworks", label: "أعمالي الفنية", icon: <Briefcase size={16} /> },
        { to: "/dashboard/won-auctions", label: "مزاداتي الفائزة", icon: <Award size={16} /> },
        { to: "/dashboard/active-bids", label: "عروضي النشطة", icon: <Tag size={16} /> },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-l border-neutral-200 shadow-sm fixed right-0 top-0 bottom-0 z-40">
            <div className="flex flex-col h-full">
                <div className="flex justify-center py-6 border-b border-neutral-200">
                    <Link to="/"><img src="/logo.svg" alt="Fanan Logo" className="h-16" /></Link>
                </div>

                <nav className="flex flex-col flex-grow p-4 space-y-1 overflow-y-auto">
                    {navLinks.map(({ to, label, icon }) => (
                        <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-primary/10 text-primary-dark" : "text-neutral-700 hover:bg-primary/5 hover:text-primary-dark"}`}>
                            {icon}<span>{label}</span>
                        </NavLink>
                    ))}

                    {user && (
                        <div>
                            <button onClick={() => toggleMenu("dashboard")} className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname.startsWith("/dashboard") ? "bg-primary/10 text-primary-dark" : "text-neutral-700 hover:bg-primary/5 hover:text-primary-dark"}`}>
                                <div className="flex items-center gap-3"><LayoutDashboard size={18} /><span>لوحة التحكم</span></div>
                                <ChevronDown size={16} className={`transition-transform ${openMenus["dashboard"] ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {openMenus["dashboard"] && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mr-4 mt-1 space-y-1 border-r-2 border-primary/20">
                                        {dashboardSubmenu.map((item) => (
                                            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `flex items-center gap-2 pl-8 pr-4 py-1.5 rounded-md text-sm transition-all ${isActive ? "bg-primary/10 text-primary-dark font-medium" : "text-neutral-700 hover:text-primary-dark"}`}>
                                                {item.icon}<span>{item.label}</span>
                                            </NavLink>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {user?.role === "ADMIN" && (
                        <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-secondary/10 text-secondary-dark" : "text-secondary-dark hover:bg-secondary/5"}`}>
                            <Shield size={18} /><span>لوحة الإدارة</span>
                        </NavLink>
                    )}
                </nav>

                <div className="border-t border-neutral-200 p-4">
                    {user ? (<LogoutButton />) : (
                        <div className="flex flex-col gap-2">
                            <Link to="/login" className="..."><LogIn size={16} /> تسجيل الدخول</Link>
                            <Link to="/register" className="..."><UserPlus size={16} /> إنشاء حساب</Link>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;