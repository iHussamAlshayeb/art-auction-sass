import { useState, useEffect } from 'react';
import { getNotifications } from '../services/api';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getNotifications()
            .then(res => setNotifications(res.data.notifications))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-neutral-200">
                <h1 className="text-3xl font-bold text-neutral-900 mb-6 border-b border-neutral-200 pb-4">
                    الإشعارات
                </h1>
                {loading ? (
                    <Spinner />
                ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map(notif => (
                            <Link to={notif.link || '#'} key={notif.id} className="block p-4 rounded-lg hover:bg-primary/5 transition-colors border-b border-neutral-100 last:border-b-0">
                                <p className="font-semibold text-neutral-800">{notif.message}</p>
                                <span className="text-xs text-neutral-500">{new Date(notif.createdAt).toLocaleString('ar-SA')}</span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-neutral-700 text-center py-8">لا توجد إشعارات جديدة.</p>
                )}
            </div>
        </div>
    );
}

export default NotificationsPage;