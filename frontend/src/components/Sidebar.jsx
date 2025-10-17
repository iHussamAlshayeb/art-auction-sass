import { Link, useLocation } from "react-router-dom";
import { Home, Image, Users, LayoutDashboard, Shield, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    const navLinks = [
        { to: "/", label: "الرئيسية", icon: <Home size={18} /> },
        { to: "/gallery", label: "المعرض", icon: <Image size={18} /> },
        { to: "/artists", label: "الفنانون", icon: <Users size={18} /> },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-l border-gray-200 shadow-sm fixed right-0 top-0 bottom-0 z-40">
            <div className="flex flex-col h-full">
                {/* الشعار */}
                <div className="flex justify-center py-6 border-b">
                    <Link to="/">
                        <img src="/logo.svg" alt="Fanan Logo" className="h-16" />
                    </Link>
                </div>

                {/* روابط التنقل */}
                <nav className="flex flex-col flex-grow p-4 space-y-1 overflow-y-auto">
                    {navLinks.map(({ to, label, icon }) => {
                        const active = location.pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active
                                    ? "bg-orange-100 text-orange-600"
                                    : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                    }`}
                            >
                                {icon}
                                <span>{label}</span>
                            </Link>
                        );
                    })}

                    {user && (
                        <Link
                            to="/dashboard"
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname.startsWith("/dashboard")
                                ? "bg-orange-100 text-orange-600"
                                : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                }`}
                        >
                            <LayoutDashboard size={18} />
                            <span>لوحة التحكم</span>
                        </Link>
                    )}

                    {user?.role === "ADMIN" && (
                        <Link
                            to="/admin"
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname.startsWith("/admin")
                                ? "bg-red-100 text-red-600"
                                : "text-red-500 hover:bg-red-50 hover:text-red-700"
                                }`}
                        >
                            <Shield size={18} />
                            <span>لوحة الإدارة</span>
                        </Link>
                    )}
                </nav>

                {/* تسجيل الدخول / الخروج */}
                <div className="border-t p-4">
                    {user ? (
                        <LogoutButton />
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Link
                                to="/login"
                                className="flex items-center justify-center gap-2 text-gray-700 hover:text-orange-600 font-medium transition"
                            >
                                <LogIn size={16} />
                                تسجيل الدخول
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-full text-center shadow-md transition-all"
                            >
                                <UserPlus size={16} />
                                إنشاء حساب
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;