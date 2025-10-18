import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, Image, Users, LayoutDashboard, Shield, LogIn, UserPlus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

const MobileMenu = ({ isOpen, setIsOpen }) => {
    const { user } = useAuth();
    const location = useLocation();

    const navLinks = [
        { to: "/", label: "الرئيسية", icon: <Home size={18} /> },
        { to: "/gallery", label: "المعرض", icon: <Image size={18} /> },
        { to: "/artists", label: "الفنانون", icon: <Users size={18} /> },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Dark overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu panel */}
                    <motion.aside
                        initial={{ x: 300 }}
                        animate={{ x: 0 }}
                        exit={{ x: 300 }}
                        transition={{ type: "tween", duration: 0.3 }}
                        className="md:hidden flex flex-col w-64 bg-white shadow-lg fixed right-0 top-0 bottom-0 z-50"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header with close button */}
                            <div className="flex justify-between items-center px-4 py-4 border-b">
                                <Link to="/" onClick={() => setIsOpen(false)}>
                                    <img src="/logo.svg" alt="Fanan Logo" className="h-16" />
                                </Link>
                                <button onClick={() => setIsOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <nav className="flex flex-col flex-grow p-4 space-y-1">
                                {navLinks.map(({ to, label, icon }) => (
                                    <NavLink key={to} to={to} end={to === "/"} onClick={() => setIsOpen(false)} className={({ isActive }) => `...`}>{icon}<span>{label}</span></NavLink>
                                ))}
                                {user && (
                                    <NavLink to="/dashboard" onClick={() => setIsOpen(false)} className={({ isActive }) => `...`}><LayoutDashboard size={18} /><span>لوحة التحكم</span></NavLink>
                                )}
                                {user?.role === "ADMIN" && (
                                    <NavLink to="/admin" onClick={() => setIsOpen(false)} className={({ isActive }) => `...`}><Shield size={18} /><span>لوحة الإدارة</span></NavLink>
                                )}
                            </nav>

                            {/* Login/Logout Section */}
                            <div className="border-t p-4">
                                {user ? (
                                    <div onClick={() => setIsOpen(false)}><LogoutButton /></div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <Link to="/login" onClick={() => setIsOpen(false)} className="..."><LogIn size={16} /> تسجيل الدخول</Link>
                                        <Link to="/register" onClick={() => setIsOpen(false)} className="..."><UserPlus size={16} /> إنشاء حساب</Link>
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