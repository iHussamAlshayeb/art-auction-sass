import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await loginUser(formData);
      login(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تسجيل الدخول.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-neutral-200 p-10 space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-primary-dark mb-3">تسجيل الدخول</h2>
          <p className="text-neutral-700">أدخل بيانات حسابك للمتابعة</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              name="email"
              type="email"
              required
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="كلمة المرور"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg shadow-md transition-all duration-200"
          >
            تسجيل الدخول
          </button>
        </form>

        <div className="text-center text-neutral-700 text-sm">
          <p>
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
