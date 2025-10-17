import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiChevronLeft, FiChevronDown, FiHome, FiUser, FiImage } from "react-icons/fi";

function DashboardSidebar({ isOpen, setIsOpen }) {
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (menu) => {
        setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
    };

    const links = [
        { to: "/dashboard", label: "الرئيسية", icon: <FiHome /> },
        {
            label: "الفنانون",
            icon: <FiUser />,
            submenu: [
                { to: "/dashboard/artists/top", label: "فنانين بارزين" },
                { to: "/dashboard/artists/new", label: "فنانين جدد" },
                { to: "/dashboard/artists/featured", label: "المميزون" },
            ],
        },
        {
            label: "المعرض",
            icon: <FiImage />,
            submenu: [
                { to: "/dashboard/gallery/paintings", label: "لوحات" },
                { to: "/dashboard/gallery/sculptures", label: "منحوتات" },
                { to: "/dashboard/gallery/photos", label: "تصوير فوتوغرافي" },
            ],
        },
    ];

    return (
        <>
            {/* خلفية سوداء شفافة عند فتح القائمة في الجوال */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
                ></div>
            )}

            {/* القائمة نفسها */}
            <aside
                className={`fixed top-0 right-0 z-50 h-full w-64 bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          md:translate-x-0 md:static md:shadow-none
        `}
            >
                {/* الشعار */}
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <h2 className="text-lg font-bold text-orange-600">لوحة التحكم</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden text-gray-500 hover:text-orange-600"
                    >
                        ✕
                    </button>
                </div>

                {/* روابط القائمة */}
                <nav className="flex flex-col p-4 overflow-y-auto">
                    {links.map((item, i) => {
                        const isActive =
                            location.pathname === item.to ||
                            item.submenu?.some((s) => location.pathname === s.to);

                        if (!item.submenu) {
                            return (
                                <Link
                                    key={i}
                                    to={item.to}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${isActive
                                            ? "bg-orange-100 text-orange-600"
                                            : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            );
                        }

                        return (
                            <div key={i}>
                                <button
                                    onClick={() => toggleMenu(item.label)}
                                    className={`flex w-full items-center justify-between gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${isActive
                                            ? "bg-orange-100 text-orange-600"
                                            : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        {item.label}
                                    </div>
                                    {openMenus[item.label] ? (
                                        <FiChevronDown size={16} />
                                    ) : (
                                        <FiChevronLeft size={16} />
                                    )}
                                </button>

                                {/* القوائم الفرعية مع الأنميشن */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus[item.label] ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                                        }`}
                                >
                                    {item.submenu.map((sub, j) => (
                                        <Link
                                            key={j}
                                            to={sub.to}
                                            onClick={() => setIsOpen(false)}
                                            className={`block px-6 py-1.5 rounded-md text-sm transition ${location.pathname === sub.to
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
                </nav>
            </aside>
        </>
    );
}

export default DashboardSidebar;
