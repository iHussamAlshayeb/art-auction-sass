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
            className="fixed bottom-8 right-8 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-transform duration-300 hover:scale-110 z-40"
            aria-label="Add new artwork"
        >
            <FiPlus size={24} />
        </Link>
    );
}

export default FloatingActionButton;
