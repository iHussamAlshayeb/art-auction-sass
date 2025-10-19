import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPlus } from 'react-icons/fi';

function FloatingActionButton() {
    const { user } = useAuth();

    // بما أن كل المستخدمين الآن يمكنهم إضافة أعمال، لم نعد بحاجة لفحص الدور
    if (!user) {
        return null;
    }

    return (
        <Link
            to="/artworks/new"
            // تم تحديث الألوان هنا
            className="group hidden md:flex items-center fixed bottom-8 left-8 bg-secondary hover:bg-secondary-dark text-white p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out z-40"
            aria-label="Add new artwork"
        >
            <FiPlus size={24} />
            <span className="max-w-0 group-hover:max-w-xs transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap group-hover:mr-2">
                إضافة عمل
            </span>
        </Link>
    );
}

export default FloatingActionButton;