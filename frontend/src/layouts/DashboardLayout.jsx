import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, Image, Users, LayoutDashboard, User, Lock, Briefcase, Award, Tag, Shield, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    // 1. التحقق مما إذا كنا داخل لوحة التحكم
    const isDashboard = location.pathname.startsWith('/dashboard');

    // روابط القائمة الرئيسية
    const mainLinks = [
        { to: "/", label: "الرئيسية", icon: <Home size={18} /> },
        { to: "/gallery", label: "المعرض", icon: <Image size={18} /> },
        { to: "/artists", label: "الفنانون", icon: <Users size={18} /> },
    ];

    // روابط لوحة التحكم
    const dashboardLinks = [
        { to: "/dashboard", label: "نظرة عامة", icon: <LayoutDashboard size={18} />, end: true },
        { to: "/dashboard/profile", label: "تعديل الملف الشخصي", icon: <User size={18} /> },
        { to: "/dashboard/password", label: "تغيير كلمة المرور", icon: <Lock size={18} /> },
    ];
    const studentLinks = [
        { to: "/dashboard/my-artworks", label: "أعمالي الفنية", icon: <Briefcase size={18} /> },
    ];
    const buyerLinks = [
        { to: "/dashboard/won-auctions", label: "مزاداتي الفائزة", icon: <Award size={18} /> },
        { to: "/dashboard/active-bids", label: "عروضي النشطة", icon: <Tag size={18} /> },
    ];
    const adminLink = { to: "/admin", label: "لوحة الإدارة", icon: <Shield size={18} /> };


    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-l border-gray-200 shadow-sm fixed right-0 top-0 bottom-0 z-40">
            <div className="flex flex-col h-full">
                {/* الشعار */}
                <div className="flex justify-center py-6 border-b">
                    <Link to="/">
                        <img src="/logo.svg" alt="Fanan Logo" className="h-16" />
                    </Link>
                </div>

                {/* 2. عرض الروابط بناءً على الشرط */}
                {isDashboard ? (
                    // === إذا كنا داخل لوحة التحكم، اعرض روابطها ===
                    <nav className="flex flex-col flex-grow p-4 space-y-1">
                        {dashboardLinks.map(({ to, label, icon, end }) => (
                            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-orange-100 text-orange-600" : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"}`}>
                                {icon}<span>{label}</span>
                            </NavLink>
                        ))}
                        {user.role === 'STUDENT' && studentLinks.map(({ to, label, icon }) => (<NavLink key={to} to={to} className={({ isActive }) => `...`}>{icon}<span>{label}</span></NavLink>))}
                        {user.role === 'BUYER' && buyerLinks.map(({ to, label, icon }) => (<NavLink key={to} to={to} className={({ isActive }) => `...`}>{icon}<span>{label}</span></NavLink>))}
                    </nav>
                ) : (
                    // === إذا كنا خارج لوحة التحكم، اعرض الروابط الرئيسية ===
                    <nav className="flex flex-col flex-grow p-4 space-y-1">
                        {mainLinks.map(({ to, label, icon }) => (
                            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-orange-100 text-orange-600" : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"}`}>
                                {icon}<span>{label}</span>
                            </NavLink>
                        ))}
                        {user?.role === "ADMIN" && (<NavLink to={adminLink.to} className={({ isActive }) => `...`}>{adminLink.icon}<span>{adminLink.label}</span></NavLink>)}
                    </nav>
                )}


                {/* منطقة تسجيل الدخول/الخروج تبقى كما هي */}
                <div className="border-t p-4">
                    {user ? (
                        <div className="flex flex-col gap-2">
                            {/* زر للذهاب للداشبورد إذا لم نكن فيه */}
                            {!isDashboard && <Link to="/dashboard" className="flex items-center justify-center gap-2 bg-orange-50 text-orange-600 font-semibold py-2 px-5 rounded-full text-center shadow-sm transition-all"> <LayoutDashboard size={16} /> لوحة التحكم</Link>}
                            <LogoutButton />
                        </div>
                    ) : (
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