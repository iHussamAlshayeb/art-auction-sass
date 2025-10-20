import { useState } from 'react';
import { updateMyPassword } from '../services/api';
import toast from 'react-hot-toast';

function PasswordEditor() {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await updateMyPassword(formData);
      toast.success(response.data.message);
      setFormData({ currentPassword: '', newPassword: '' }); // إفراغ الحقول بعد النجاح
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في تحديث كلمة المرور.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-neutral-200">
      <h3 className="text-2xl font-bold text-neutral-900 mb-4">تغيير كلمة المرور</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-neutral-700">كلمة المرور الحالية</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="mt-1 w-full p-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700">كلمة المرور الجديدة</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="mt-1 w-full p-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-neutral-900 hover:bg-neutral-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-sm transition-all duration-200 disabled:bg-gray-400"
        >
          {isSubmitting ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
        </button>
      </form>
    </div>
  );
}

export default PasswordEditor;