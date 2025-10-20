import { useState, useEffect } from 'react'; // 1. استيراد useEffect
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext'; // 2. استيراد useAuth
import { FiCheckCircle } from "react-icons/fi";
function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // حالة جديدة للتحقق من كلمة المرور
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // دالة للتحقق من كلمة المرور في الوقت الفعلي
  const validatePassword = (password) => {
    setPasswordValidations({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isPasswordValid = Object.values(passwordValidations).every(Boolean);
    if (!isPasswordValid) {
      setError("كلمة المرور لا تلبي جميع المتطلبات.");
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      await registerUser(formData);
      setSuccess('تم إنشاء الحساب بنجاح! سيتم توجيهك لصفحة تسجيل الدخول...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل التسجيل.');
    }
  };

  // مكون لعرض كل شرط من شروط التحقق
  const ValidationItem = ({ isValid, text }) => (
    <li className={`flex items-center gap-2 text-sm ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
      {isValid ? <FiCheckCircle /> : <FiXCircle />}
      {text}
    </li>
  );

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-lg space-y-8 bg-white/90 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-xl border border-neutral-200">
        <div>
          <h2 className="text-center text-4xl font-extrabold tracking-tight text-primary-dark">
            إنشاء حساب جديد
          </h2>
        </div>

        {success ? (
          <p className="text-center text-lg text-green-600">{success}</p>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700">الاسم الكامل</label>
                <input
                  name="name" type="text" required
                  className="mt-1 w-full p-3 border border-neutral-200 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="اسمك الكامل" value={formData.name} onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">البريد الإلكتروني</label>
                <input
                  name="email" type="email" required
                  className="mt-1 w-full p-3 border border-neutral-200 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="email@example.com" value={formData.email} onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">كلمة المرور</label>
                <input
                  name="password" type="password" required
                  className="mt-1 w-full p-3 border border-neutral-200 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="••••••••" value={formData.password} onChange={handleChange}
                />
              </div>
              {/* قائمة التحقق من كلمة المرور */}
              <ul className="space-y-1 mt-2">
                <ValidationItem isValid={passwordValidations.length} text="8 أحرف على الأقل" />
                <ValidationItem isValid={passwordValidations.uppercase} text="حرف كبير واحد على الأقل (A-Z)" />
                <ValidationItem isValid={passwordValidations.lowercase} text="حرف صغير واحد على الأقل (a-z)" />
                <ValidationItem isValid={passwordValidations.number} text="رقم واحد على الأقل (0-9)" />
              </ul>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-5 rounded-lg shadow-md transition-all duration-200"
              >
                إنشاء الحساب
              </button>
            </div>
          </form>
        )}

        <div className="text-sm text-center text-neutral-700">
          <p>
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
              سجل دخولك من هنا
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
