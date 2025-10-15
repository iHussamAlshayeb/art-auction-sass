import { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile, uploadImage } from '../services/api';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

function ProfileEditor() {
  const [formData, setFormData] = useState(null); // Initial state is null
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // 1. جلب البيانات عند تحميل المكون لأول مرة
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await getMyProfile();
        setFormData(response.data.user);
        setImagePreview(response.data.user.profileImageUrl || '');
      } catch (error) {
        toast.error("فشل في تحميل بيانات الملف الشخصي.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []); // [] تعني أن هذا سيعمل مرة واحدة فقط

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      // إنشاء رابط معاينة مؤقت للصورة الجديدة
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    let finalImageUrl = formData.profileImageUrl;

    try {
      // 1. إذا اختار المستخدم صورة جديدة، قم برفعها أولاً
      if (imageFile) {
        const uploadResponse = await uploadImage(imageFile);
        finalImageUrl = uploadResponse.data.imageUrl;
      }

      // 2. قم بتحديث الملف الشخصي بالبيانات الجديدة ورابط الصورة
      const finalData = { ...formData, profileImageUrl: finalImageUrl };
      const response = await updateMyProfile(finalData);

      toast.success(response.data.message);
      setFormData(finalData); // تحديث الحالة المحلية بالبيانات الجديدة

    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل التحديث.');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // 2. عرض رسالة تحميل ريثما تصل البيانات
  if (loading || !formData) {
    return <Spinner />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <img
          src={imagePreview || 'https://via.placeholder.com/150'} // صورة افتراضية
          alt="Profile Preview"
          className="w-24 h-24 rounded-full object-cover border-4 border-orange-100 shadow-sm"
        />
        <input
          type="file"
          id="profileImageInput"
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/jpg"
          className="hidden"
        />
        <label
          htmlFor="profileImageInput"
          className="cursor-pointer text-sm font-semibold text-orange-600 hover:text-orange-500"
        >
          تغيير الصورة
        </label>
      </div>
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

      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all duration-200 disabled:bg-gray-400"
      >
        {uploading ? 'جاري الحفظ...' : 'تحديث الملف الشخصي'}
      </button>
    </form>
  );
}
export default ProfileEditor;