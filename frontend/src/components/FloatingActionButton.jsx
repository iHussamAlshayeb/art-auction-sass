import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPlus } from 'react-icons/fi';

function FloatingActionButton() {
    const { user } = useAuth();

    if (!user || user.role !== 'STUDENT') {
        return null;
    }

    return (
        <Link
            to="/artworks/new"
            // === تم تغيير "right-8" إلى "left-8" ===
            className="group md:flex items-center fixed bottom-8 left-8 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 ease-in-out z-40"
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