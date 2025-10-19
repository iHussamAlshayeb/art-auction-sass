import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogOut } from 'lucide-react';

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-red-100 text-red-600 font-semibold py-2 px-5 rounded-full text-center transition-all"
    >
      <LogOut size={16} />
      تسجيل الخروج
    </button>
  );
}

export default LogoutButton;

