import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';

function DashboardLayout() {
    return (
        // استخدام Flexbox لإنشاء تخطيط العمودين
        <div className="flex min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
            <DashboardSidebar />
            <main className="flex-grow p-6 sm:p-10">
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;