import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPlus } from 'react-icons/fi'; // استيراد أيقونة '+'

function FloatingActionButton() {
    const { user } = useAuth();

    // لا تقم بعرض أي شيء إذا كان المستخدم غير مسجل دخوله أو ليس طالبًا
    if (!user || user.role !== 'STUDENT') {
        return null;
    }

    return (
        <Link
            to="/artworks/new"
            // 1. إضافة group و flex لتفعيل التأثير على العناصر الداخلية
            className="group fixed bottom-8 right-8 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 ease-in-out z-40 flex items-center"
            aria-label="Add new artwork"
        >
            <FiPlus size={24} />
            {/* 2. إضافة النص الذي سيكون مخفيًا في البداية */}
            <span className="max-w-0 group-hover:max-w-xs transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap group-hover:ml-2">
                إضافة عمل جديد
            </span>
        </Link>
    );
}

export default FloatingActionButton;

