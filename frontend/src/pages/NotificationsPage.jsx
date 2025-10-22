import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
    getNotifications,
    markAllNotificationsRead,
    deleteNotificationById,
    deleteAllNotifications,
} from "../services/api";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";
import { FiX, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setUnreadCount, user } = useAuth();

    // 🔌 إعداد Socket.io client
    useEffect(() => {
        if (!user?.id) return;

        // ✅ إنشاء اتصال Socket.io
        const socket = io(import.meta.env.VITE_API_URL || "https://api.fanan3.com", {
            auth: { token: localStorage.getItem("token") },
            transports: ["websocket"],
        });

        // 🎧 استقبال الإشعارات الجديدة
        socket.on("notification:new", (newNotif) => {
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
            toast.success("🔔 إشعار جديد!");
        });

        // تنظيف عند مغادرة الصفحة
        return () => {
            socket.disconnect();
        };
    }, [user?.id, setUnreadCount]);

    // 🔄 جلب الإشعارات أول مرة
    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await getNotifications();
            setNotifications(res.data.notifications);
        } catch (error) {
            toast.error("فشل في جلب الإشعارات.");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success("تم تحديد الكل كمقروء.");
        } catch (error) {
            toast.error("حدث خطأ أثناء تحديث الإشعارات.");
        }
    };

    const handleDelete = async (e, notificationId) => {
        e.preventDefault();
        e.stopPropagation();

        const original = [...notifications];
        setNotifications((prev) => prev.filter((n) => n._id !== notificationId));

        try {
            await deleteNotificationById(notificationId);
            toast.success("تم حذف الإشعار.");
        } catch (error) {
            setNotifications(original);
            toast.error("فشل في حذف الإشعار.");
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm("هل أنت متأكد من حذف جميع الإشعارات؟")) return;
        try {
            await deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
            toast.success("تم حذف جميع الإشعارات.");
        } catch (error) {
            toast.error("فشل في حذف جميع الإشعارات.");
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-neutral-200">
                <div className="flex justify-between items-center mb-6 border-b border-neutral-200 pb-4">
                    <h1 className="text-3xl font-bold text-neutral-900">الإشعارات</h1>

                    <div className="flex gap-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                            >
                                تحديد الكل كمقروء ({unreadCount})
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={handleDeleteAll}
                                className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                            >
                                <FiTrash2 size={14} />
                                حذف الكل
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <Spinner />
                ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map((notif) => (
                            <Link
                                to={notif.link || "#"}
                                key={notif._id}
                                className={`relative block p-4 rounded-lg transition-colors border ${notif.isRead
                                        ? "bg-white border-neutral-100"
                                        : "bg-primary/5 border-primary/30"
                                    } hover:bg-primary/10`}
                            >
                                <div className="flex items-center gap-4">
                                    {!notif.isRead && (
                                        <div
                                            className="w-3 h-3 bg-primary rounded-full flex-shrink-0"
                                            title="غير مقروء"
                                        ></div>
                                    )}
                                    <div className="flex-grow">
                                        <p
                                            className={`font-semibold ${notif.isRead
                                                    ? "text-neutral-700"
                                                    : "text-neutral-900"
                                                }`}
                                        >
                                            {notif.message}
                                        </p>
                                        <span className="text-xs text-neutral-500">
                                            {new Date(notif.createdAt).toLocaleString("ar-SA")}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, notif._id)}
                                        className="p-1 rounded-full text-neutral-400 hover:bg-red-100 hover:text-red-600 transition-colors z-10"
                                        title="حذف الإشعار"
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-neutral-700 text-center py-8">
                        لا توجد إشعارات جديدة.
                    </p>
                )}
            </div>
        </div>
    );
}

export default NotificationsPage;
