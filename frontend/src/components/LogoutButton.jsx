import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // توجيه المستخدم إلى الصفحة الرئيسية بعد تسجيل الخروج
  };

  return (
    <button 
      onClick={handleLogout} 
      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-full shadow-md transition-all"
    >
      تسجيل الخروج
    </button>
  );
}

export default LogoutButton;