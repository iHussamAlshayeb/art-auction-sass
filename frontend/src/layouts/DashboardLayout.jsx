import { Outlet } from 'react-router-dom';

function DashboardLayout() {
    // هذا المكون الآن مسؤول فقط عن توفير مساحة للمحتوى الداخلي
    return (
        <div>
            <Outlet />
        </div>
    );
}

export default DashboardLayout;