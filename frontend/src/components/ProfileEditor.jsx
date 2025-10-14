import { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile } from '../services/api';
import toast from 'react-hot-toast';

function ProfileEditor() {
  const [formData, setFormData] = useState(null); // Initial state is null
  const [loading, setLoading] = useState(true);

  // 1. جلب البيانات عند تحميل المكون لأول مرة
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await getMyProfile();
        setFormData(response.data.user);
      } catch (error) {
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []); // [] تعني أن هذا سيعمل مرة واحدة فقط

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateMyProfile(formData);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed.');
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // 2. عرض رسالة تحميل ريثما تصل البيانات
  if (loading || !formData) {
    return <p className="text-gray-500">جاري تحميل الملف الشخصي...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-600">الاسم</label>
        <input name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-600">البريد الإلكتروني</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
      </div>

      {/* عرض حقول الطالب فقط إذا كان دوره طالبًا */}
      {formData.role === 'STUDENT' && (
        <>
          <div>
            <label className="text-sm font-medium text-gray-600">اسم المدرسة</label>
            <input name="schoolName" value={formData.schoolName || ''} onChange={handleChange} className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">المرحلة الدراسية</label>
            <input name="gradeLevel" value={formData.gradeLevel || ''} onChange={handleChange} className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">نبذة تعريفية</label>
            <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows="3" className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"></textarea>
          </div>
        </>
      )}

      <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all duration-200">تحديث الملف الشخصي</button>
    </form>
  );
}
export default ProfileEditor;