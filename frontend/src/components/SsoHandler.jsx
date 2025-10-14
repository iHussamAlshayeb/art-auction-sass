import { useEffect } from 'react'; // <-- This line was missing or incomplete
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SsoHandler() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('sso_token');

    if (token) {
      login(token);
      // Clean the token from the URL after using it
      navigate(location.pathname, { replace: true });
    }
  }, [location, login, navigate]);

  // This component renders nothing to the screen
  return null;
}

export default SsoHandler;