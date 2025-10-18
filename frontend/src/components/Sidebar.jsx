import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
    Home,
    Image,
    Users,
    LayoutDashboard,
    Shield,
    LogIn,
    UserPlus,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user } = useAuth();
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState({});
    const [collapsed, setCollapsed] = useState(false);

    const toggleMenu = (menu) => {
        setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
    };

    const navLinks = [
        { to: "/", label: "الرئيسية", icon: <Home size={18} /> },
        { to: "/gallery", label: "المعرض", icon: <Image size={18} /> },
        { to: "/artists", label: "الفنانون", icon: <Users size={18} /> },
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

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.aside
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    transition={{ type: "tween", duration: 0.35 }}
                    className={`hidden md:flex flex-col ${collapsed ? "w-20" : "w-64"
                        } bg-white border-l border-gray-200 shadow-lg fixed right-0 top-0 bottom-0 z-50 transition-all duration-300`}
                >
                    {/* ====== Header ====== */}
                    <div className="flex items-center justify-between px-4 py-4 border-b">
                        <Link to="/" className="flex justify-center w-full">
                            <img
                                src="/logo.svg"
                                alt="Fanan Logo"
                                className={`transition-all ${collapsed ? "h-10" : "h-16"}`}
                            />
                        </Link>
                        <div className="flex gap-2">
                            {/* زر التصغير / التوسيع */}
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className="hidden md:flex items-center justify-center w-8 h-8 rounded-md hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition"
                            >
                                {collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                            </button>

                            {/* زر الإغلاق */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hidden md:flex items-center justify-center w-8 h-8 rounded-md hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* ====== Navigation ====== */}
                    <nav className="flex flex-col flex-grow p-4 space-y-1 overflow-y-auto">
                        {navLinks.map(({ to, label, icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === "/"}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? "bg-orange-100 text-orange-600"
                                        : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                    }`
                                }
                                title={collapsed ? label : ""}
                            >
                                {icon}
                                {!collapsed && <span>{label}</span>}
                            </NavLink>
                        ))}

                        {/* ====== Dashboard Section ====== */}
                        {user && (
                            <div>
                                <button
                                    onClick={() => toggleMenu("dashboard")}
                                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname.startsWith("/dashboard")
                                            ? "bg-orange-100 text-orange-600"
                                            : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <LayoutDashboard size={18} />
                                        {!collapsed && <span>لوحة التحكم</span>}
                                    </div>
                                    {!collapsed && (
                                        <ChevronDown
                                            size={16}
                                            className={`transition-transform ${openMenus["dashboard"] ? "rotate-180" : ""
                                                }`}
                                        />
                                    )}
                                </button>

                                {/* Submenu */}
                                <AnimatePresence>
                                    {openMenus["dashboard"] && !collapsed && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mr-4 mt-1 space-y-1 border-r-2 border-orange-100"
                                        >
                                            {dashboardSubmenu.map((item) => (
                                                <NavLink
                                                    key={item.to}
                                                    to={item.to}
                                                    end={item.end}
                                                    className={({ isActive }) =>
                                                        `block pl-8 pr-4 py-1.5 rounded-md text-sm transition-all ${isActive
                                                            ? "bg-orange-50 text-orange-600 font-medium"
                                                            : "text-gray-600 hover:text-orange-500"
                                                        }`
                                                    }
                                                >
                                                    {item.label}
                                                </NavLink>
                                            ))}

                                            {user.role === "STUDENT" &&
                                                studentSubmenu.map((item) => (
                                                    <NavLink
                                                        key={item.to}
                                                        to={item.to}
                                                        className={({ isActive }) =>
                                                            `block pl-8 pr-4 py-1.5 rounded-md text-sm transition-all ${isActive
                                                                ? "bg-orange-50 text-orange-600 font-medium"
                                                                : "text-gray-600 hover:text-orange-500"
                                                            }`
                                                        }
                                                    >
                                                        {item.label}
                                                    </NavLink>
                                                ))}

                                            {user.role === "BUYER" &&
                                                buyerSubmenu.map((item) => (
                                                    <NavLink
                                                        key={item.to}
                                                        to={item.to}
                                                        className={({ isActive }) =>
                                                            `block pl-8 pr-4 py-1.5 rounded-md text-sm transition-all ${isActive
                                                                ? "bg-orange-50 text-orange-600 font-medium"
                                                                : "text-gray-600 hover:text-orange-500"
                                                            }`
                                                        }
                                                    >
                                                        {item.label}
                                                    </NavLink>
                                                ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* ====== Admin Panel ====== */}
                        {user?.role === "ADMIN" && (
                            <NavLink
                                to="/admin"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? "bg-red-100 text-red-600"
                                        : "text-red-500 hover:bg-red-50 hover:text-red-700"
                                    }`
                                }
                                title={collapsed ? "لوحة الإدارة" : ""}
                            >
                                <Shield size={18} />
                                {!collapsed && <span>لوحة الإدارة</span>}
                            </NavLink>
                        )}
                    </nav>

                    {/* ====== Login / Logout ====== */}
                    <div className="border-t p-4">
                        {user ? (
                            <LogoutButton compact={collapsed} />
                        ) : (
                            !collapsed && (
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
                            )
                        )}
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
