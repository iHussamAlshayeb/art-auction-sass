import { Link } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';

function Header() {
    // هذا الشريط العلوي سيظهر فقط على الجوال
    return (
        <header className="md:hidden bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-30">
            <div className="container mx-auto px-4 h-20 flex justify-between items-center">
                {/* زر القائمة (يمكن ربطه لاحقًا لإظهار قائمة منسدلة) */}
                <button className="p-2">
                    <FiMenu size={24} className="text-gray-600" />
                </button>

                {/* الشعار */}
                <Link to="/">
                    <img src="/logo.svg" alt="Fanan Logo" className="h-14" />
                </Link>

                {/* صورة المستخدم أو زر الدخول */}
                {/* (يمكن إضافة هذا الجزء لاحقًا) */}
                <div></div>
            </div>
        </header>
    );
}

export default Header;