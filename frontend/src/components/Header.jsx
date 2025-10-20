import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiSearch, FiPlusCircle } from 'react-icons/fi';

function Header({ toggleSidebar, onMenuClick }) {
    const { user } = useAuth();

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-40">
            <div className="container mx-auto px-4 h-20 flex justify-between items-center">
                {/* الجهة اليمنى */}
                <div className="flex items-center gap-4">
                    {/* زر القائمة لسطح المكتب */}
                    <button onClick={toggleSidebar} className="hidden md:block p-2 rounded-full hover:bg-neutral-200 transition-colors">
                        <FiMenu size={24} className="text-neutral-700" />
                    </button>
                    {/* زر القائمة للجوال */}
                    <button onClick={onMenuClick} className="md:hidden p-2 rounded-full hover:bg-neutral-200 transition-colors">
                        <FiMenu size={24} className="text-neutral-700" />
                    </button>
                    <Link to="/">
                        <img src="/logo.svg" alt="Fanan Logo" className="h-14" />
                    </Link>
                </div>

                {/* المنتصف: شريط البحث (لسطح المكتب) */}
                <div className="hidden md:flex flex-grow max-w-xl mx-4">
                    <form className="w-full flex">
                        <input
                            type="text"
                            placeholder="ابحث..."
                            className="w-full p-2.5 border border-neutral-200 rounded-r-full focus:ring-2 focus:ring-primary focus:outline-none text-right"
                        />
                        <button type="submit" className="bg-neutral-200 border-y border-l border-neutral-200 px-6 rounded-l-full hover:bg-neutral-300">
                            <FiSearch className="text-neutral-700" />
                        </button>
                    </form>
                </div>

                {/* الجهة اليسرى */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            {user.role === 'STUDENT' && (
                                <Link to="/artworks/new" title="إضافة عمل فني" className="hidden sm:block">
                                    <FiPlusCircle size={26} className="text-neutral-700 hover:text-primary" />
                                </Link>
                            )}
                            <Link to="/dashboard">
                                <img
                                    src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.name}&background=E0F2F1&color=00796B&size=128`}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            </Link>
                        </>
                    ) : (
                        <Link to="/login" className="bg-secondary hover:bg-secondary-dark text-white font-semibold py-2 px-5 rounded-full shadow-md text-sm whitespace-nowrap">
                            تسجيل الدخول
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;