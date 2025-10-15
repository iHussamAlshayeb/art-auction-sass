import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';
import { FiMenu } from 'react-icons/fi';

function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="relative flex min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
            {/* القائمة الجانبية */}
            <DashboardSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* المحتوى الرئيسي */}
            <main className="flex-grow p-6 sm:p-10 transition-all duration-300 md:ml-64">
                {/* زر الهامبرغر للشاشات الصغيرة */}
                <button
                    className="md:hidden mb-4 p-2 rounded-md bg-white/80 border border-orange-100"
                    onClick={() => setSidebarOpen(true)}
                >
                    <FiMenu size={24} className="text-gray-700" />
                </button>

                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;