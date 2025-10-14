import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';

function DashboardLayout() {
    return (
        <div className="flex">
            <DashboardSidebar />
            <main className="flex-grow p-6 sm:p-10">
                {/* هنا سيتم عرض محتوى القسم المختار */}
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;