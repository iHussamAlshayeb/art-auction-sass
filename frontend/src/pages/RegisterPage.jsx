import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

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
    <div className="pt-28 pb-20 px-6 sm:px-10 bg-gradient-to-b from-orange-50 via-white to-orange-50 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg space-y-8 bg-white/90 backdrop-blur-sm p-8 sm:p-10 rounded-3xl shadow-lg border border-orange-100">
        <div>
          <h2 className="text-center text-4xl font-extrabold tracking-tight text-orange-600">
            إنشاء حساب جديد
          </h2>
        </div>

        {success ? (
          <p className="text-center text-lg text-green-600">{success}</p>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">الاسم الكامل</label>
                <input
                  name="name" type="text" required
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  placeholder="اسمك الكامل" value={formData.name} onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">البريد الإلكتروني</label>
                <input
                  name="email" type="email" required
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  placeholder="email@example.com" value={formData.email} onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">كلمة المرور</label>
                <input
                  name="password" type="password" required
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••" value={formData.password} onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">أرغب في التسجيل كـ</label>
                <select 
                  name="role" value={formData.role} onChange={handleChange}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="BUYER">مشتري (أرغب في شراء الأعمال)</option>
                  <option value="STUDENT">طالب (أرغب في بيع أعمالي)</option>
                </select>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-5 rounded-xl shadow-sm transition-all duration-200"
              >
                إنشاء الحساب
              </button>
            </div>
          </form>
        )}
        
        <div className="text-sm text-center text-gray-600">
          <p>
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-500">
              سجل دخولك من هنا
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;