import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, Image, Users, LayoutDashboard, Shield, User, Lock, Briefcase, Award, Tag, LogIn, UserPlus, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (menu) => {
        setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
    };

    const navLinks = [
        { to: "/", label: "الرئيسية", icon: <Home size={18} /> },
        { to: "/gallery", label: "المعرض", icon: <Image size={18} /> },
        { to: "/artists", label: "الفنانون", icon: <Users size={18} /> },
    ];

    // روابط لوحة التحكم المحدثة
    const dashboardSubmenu = [
        { to: "/dashboard", label: "نظرة عامة" },
        { to: "/dashboard/profile", label: "تعديل الملف الشخصي" },
        { to: "/dashboard/password", label: "تغيير كلمة المرور" },
    ];
    const studentSubmenu = [{ to: "/dashboard/my-artworks", label: "أعمالي الفنية" }];
    const buyerSubmenu = [
        { to: "/dashboard/won-auctions", label: "مزاداتي الفائزة" },
        { to: "/dashboard/active-bids", label: "عروضي النشطة" },
    ];
    // رابط لوحة الإدارة
    const adminLink = { to: "/admin", label: "لوحة الإدارة", icon: <Shield size={18} /> };


    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-l border-gray-200 shadow-sm fixed right-0 top-0 bottom-0 z-40">
            <div className="flex flex-col h-full">
                <div className="flex justify-center py-6 border-b">
                    <Link to="/"><img src="/logo.svg" alt="Fanan Logo" className="h-16" /></Link>
                </div>

                <nav className="flex flex-col flex-grow p-4 space-y-1 overflow-y-auto">
                    {/* الروابط الرئيسية */}
                    {navLinks.map(({ to, label, icon }) => (
                        <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-orange-100 text-orange-600" : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"}`}>
                            {icon}<span>{label}</span>
                        </NavLink>
                    ))}

                    {/* القائمة المنسدلة للوحة التحكم */}
                    {user && (
                        <div>
                            <button onClick={() => toggleMenu("dashboard")} className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname.startsWith("/dashboard") ? "bg-orange-100 text-orange-600" : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"}`}>
                                <div className="flex items-center gap-3"><LayoutDashboard size={18} /><span>لوحة التحكم</span></div>
                                <ChevronDown size={16} className={`transition-transform ${openMenus["dashboard"] ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {openMenus["dashboard"] && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mr-4 mt-1 space-y-1 border-r-2 border-orange-100">
                                        {dashboardSubmenu.map((item) => (
                                            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `block pl-8 pr-4 py-1.5 rounded-md text-sm transition-all ${isActive ? "bg-orange-50 text-orange-600 font-medium" : "text-gray-600 hover:text-orange-500"}`}>{item.label}</NavLink>
                                        ))}
                                        {user.role === 'STUDENT' && studentSubmenu.map((item) => (<NavLink key={item.to} to={item.to} className={({ isActive }) => `...`}>{item.label}</NavLink>))}
                                        {user.role === 'BUYER' && buyerSubmenu.map((item) => (<NavLink key={item.to} to={item.to} className={({ isActive }) => `...`}>{item.label}</NavLink>))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* رابط لوحة الإدارة */}
                    {user?.role === "ADMIN" && (
                        <NavLink to={adminLink.to} className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-red-100 text-red-600" : "text-red-500 hover:bg-red-50 hover:text-red-700"}`}>
                            {adminLink.icon}<span>{adminLink.label}</span>
                        </NavLink>
                    )}
                </nav>

                {/* منطقة تسجيل الدخول/الخروج */}
                <div className="border-t p-4">
                    {user ? (<LogoutButton />) : ( /* ... */ )}
                </div>
            </div>
        </aside>
    );
};
export default Sidebar;