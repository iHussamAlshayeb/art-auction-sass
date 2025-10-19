import { Link } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const { user } = useAuth();

function Header() {
    // هذا الشريط العلوي سيظهر فقط على الجوال
    return (
        <header className="md:hidden bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-30">
            <div className="container mx-auto px-4 h-20 flex justify-between items-center">
                {/* زر القائمة (يمكن ربطه لاحقًا لإظهار قائمة منسدلة) */}
                <button className="p-2">
                    {/* <FiMenu size={24} className="text-gray-600" /> */}
                </button>

                {/* الشعار */}
                <Link to="/">
                    <img src="/logo.svg" alt="Fanan Logo" className="h-14" />
                </Link>

                {/* صورة المستخدم أو زر الدخول */}
                <Link to={user ? "/dashboard" : "/login"} className="w-10 h-10">
                    {user && (
                        <img
                            src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.name}&background=ffedd5&color=f97316&size=128`}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    )}
                </Link>
                <div></div>
            </div>
        </header>
    );
}

export default Header;