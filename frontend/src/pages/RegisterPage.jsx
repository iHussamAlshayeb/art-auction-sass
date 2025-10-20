import { useState, useEffect } from 'react'; // 1. استيراد useEffect
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext'; // 2. استيراد useAuth

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // 3. الحصول على حالة المستخدم

  // ---== الحل هنا: التحقق من حالة الدخول ==---
  useEffect(() => {
    // إذا كان المستخدم مسجلاً دخوله، قم بإعادة توجيهه فورًا
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]); // 4. تشغيل هذا التأثير عند تغير حالة المستخدم

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
