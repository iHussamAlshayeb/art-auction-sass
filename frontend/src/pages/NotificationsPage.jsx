import { useState, useEffect } from 'react';
import {
    getNotifications,
    markAllNotificationsRead,
    deleteNotificationById,
} from '../services/api';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setUnreadCount } = useAuth();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = () => {
        setLoading(true);
        getNotifications()
            .then((res) => {
                // ✅ ضمان وجود _id
                const notifs = res.data.notifications || [];
                setNotifications(notifs);
            })
            .catch(() => toast.error('فشل في تحميل الإشعارات'))
            .finally(() => setLoading(false));
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
            toast.success('تم تحديد الكل كمقروء');
        } catch {
            toast.error('فشل في تحديث الإشعارات');
        }
    };

    const handleDelete = async (e, notificationId) => {
        e.preventDefault();
        e.stopPropagation();

        if (!notificationId) {
            console.error('❌ Notification ID is undefined');
            toast.error('فشل حذف الإشعار (رقم المعرف مفقود)');
            return;
        }

        // Optimistic UI
        const original = [...notifications];
        setNotifications((prev) =>
            prev.filter((n) => n._id !== notificationId)
        );

        try {
            await deleteNotificationById(notificationId);
            toast.success('تم حذف الإشعار');
        } catch {
            toast.error('فشل حذف الإشعار، تمت استعادته.');
            setNotifications(original);
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-neutral-200">
                <div className="flex justify-between items-center mb-6 border-b border-neutral-200 pb-4">
                    <h1 className="text-3xl font-bold text-neutral-900">الإشعارات</h1>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                        >
                            تحديد الكل كمقروء ({unreadCount})
                        </button>
                    )}
                </div>

                {loading ? (
                    <Spinner />
                ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map((notif) => (
                            <Link
                                to={notif.link || '#'}
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
                                                    ? 'text-neutral-700'
                                                    : 'text-neutral-900'
                                                }`}
                                        >
                                            {notif.message}
                                        </p>
                                        <span className="text-xs text-neutral-500">
                                            {new Date(notif.createdAt).toLocaleString('ar-SA')}
                                        </span>
                                    </div>

                                    {/* زر الحذف */}
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
        </div>
    );
}

export default NotificationsPage;
