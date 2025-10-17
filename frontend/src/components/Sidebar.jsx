import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Home,
    Image,
    Users,
    LayoutDashboard,
    ChevronDown,
    ChevronLeft,
} from "lucide-react";
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
        {
            label: "الفنانون",
            icon: <Users size={18} />,
            submenu: [
                { to: "/artists/top", label: "فنانين بارزين" },
                { to: "/artists/new", label: "فنانين جدد" },
                { to: "/artists/featured", label: "المميزون" },
            ],
        },
        {
            label: "المعرض",
            icon: <Image size={18} />,
            submenu: [
                { to: "/gallery/paintings", label: "لوحات" },
                { to: "/gallery/sculptures", label: "منحوتات" },
                { to: "/gallery/photography", label: "تصوير فوتوغرافي" },
            ],
        },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-l border-gray-200 shadow-md fixed right-0 top-0 bottom-0 z-40">
            <div className="flex flex-col h-full">
                <div className="flex justify-center py-6 border-b">
                    <Link to="/">
                        <img src="/logo.svg" alt="Fanan Logo" className="h-16" />
                    </Link>
                </div>

                <nav className="flex flex-col flex-grow p-4 space-y-1 overflow-y-auto">
                    {navLinks.map((item, i) => {
                        const active =
                            location.pathname === item.to ||
                            item.submenu?.some((s) => location.pathname === s.to);

                        if (!item.submenu) {
                            return (
                                <Link
                                    key={i}
                                    to={item.to}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${active
                                            ? "bg-orange-100 text-orange-600"
                                            : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            );
                        }

                        return (
                            <div key={i}>
                                <button
                                    onClick={() => toggleMenu(item.label)}
                                    className={`flex w-full items-center justify-between gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${active
                                            ? "bg-orange-100 text-orange-600"
                                            : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </div>
                                    {openMenus[item.label] ? (
                                        <ChevronDown size={16} />
                                    ) : (
                                        <ChevronLeft size={16} />
                                    )}
                                </button>

                                {/* القائمة الفرعية مع انميشن */}
                                <div
                                    className={`
                    overflow-hidden
                    transition-all duration-300 ease-in-out
                    ${openMenus[item.label] ? "max-h-60" : "max-h-0"}
                  `}
                                >
                                    {item.submenu.map((sub, j) => (
                                        <Link
                                            key={j}
                                            to={sub.to}
                                            className={`block px-4 py-1.5 rounded-md text-sm transition ${location.pathname === sub.to
                                                    ? "bg-orange-50 text-orange-600 font-medium"
                                                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                                                }`}
                                        >
                                            {sub.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
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
                </nav>

                <div className="border-t p-4">
                    {user ? (
                        <LogoutButton />
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Link
                                to="/login"
                                className="flex items-center justify-center gap-2 text-gray-700 hover:text-orange-600 font-medium transition"
                            >
                                تسجيل الدخول
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-full text-center shadow-md transition-all"
                            >
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
