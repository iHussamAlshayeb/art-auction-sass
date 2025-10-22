import { useState, useEffect } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false); // ✅ للحذف الكلي
    const { setUnreadCount } = useAuth();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = () => {
        setLoading(true);
        getNotifications()
            .then((res) => {
                const notifs = res.data.notifications || [];
                setNotifications(notifs);
            })
            .catch(() => toast.error("فشل في تحميل الإشعارات"))
            .finally(() => setLoading(false));
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
            toast.success("تم تحديد الكل كمقروء");
        } catch {
            toast.error("فشل في تحديث الإشعارات");
        }
    };

    const handleDelete = async (e, notificationId) => {
        e.preventDefault();
        e.stopPropagation();

        if (!notificationId) {
            toast.error("فشل حذف الإشعار (رقم المعرف مفقود)");
            return;
        }

        const original = [...notifications];
        setNotifications((prev) =>
            prev.filter((n) => n._id !== notificationId)
        );

        try {
            await deleteNotificationById(notificationId);
            toast.success("تم حذف الإشعار");
        } catch {
            toast.error("فشل حذف الإشعار، تمت استعادته.");
            setNotifications(original);
        }
    };

    const handleConfirmDeleteAll = async () => {
        try {
            await deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
            setShowConfirmModal(false);
            toast.success("تم حذف جميع الإشعارات بنجاح");
        } catch {
            toast.error("فشل في حذف جميع الإشعارات");
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-neutral-200">
                {/* ===== رأس الصفحة ===== */}
                <div className="flex flex-wrap justify-between items-center gap-3 mb-6 border-b border-neutral-200 pb-4">
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
                                onClick={() => setShowConfirmModal(true)} // ✅ فتح المودال
                                className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                            >
                                <FiTrash2 size={16} />
                                حذف الكل
                            </button>
                        )}
                    </div>
                </div>

                {/* ===== قائمة الإشعارات ===== */}
                {loading ? (
                    <Spinner />
                ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map((notif) => (
                            <Link
                                to={notif.link || "#"}
                                key={notif._id || notif.id}
                                className="relative block p-4 rounded-lg hover:bg-primary/5 transition-colors border-b border-neutral-100 last:border-b-0"
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

                                    {/* زر حذف فردي */}
                                    <button
                                        onClick={(e) =>
                                            handleDelete(e, notif._id || notif.id)
                                        }
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

            {/* ===== نافذة تأكيد الحذف الكلي ===== */}
            <AnimatePresence>
                {showConfirmModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <h2 className="text-xl font-bold text-neutral-900 mb-2">
                                تأكيد الحذف
                            </h2>
                            <p className="text-neutral-600 mb-6">
                                هل أنت متأكد أنك تريد حذف <b>جميع الإشعارات؟</b>
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-4 py-2 rounded-lg bg-neutral-200 text-neutral-800 hover:bg-neutral-300 transition-all"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleConfirmDeleteAll}
                                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                                >
                                    حذف الكل
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default NotificationsPage;
