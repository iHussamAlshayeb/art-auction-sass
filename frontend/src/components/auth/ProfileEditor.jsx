import { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile, uploadImage } from '../../services/api';
import toast from 'react-hot-toast';
// import Spinner from './Spinner';
import { Spinner } from "../";

function ProfileEditor() {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await getMyProfile();
        setFormData(response.data.user);
        if (response.data.user.profileImageUrl) {
          setImagePreview(response.data.user.profileImageUrl);
        }
      } catch (error) {
        toast.error("فشل في تحميل بيانات الملف الشخصي.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    let finalImageUrl = formData.profileImageUrl;

    try {
      if (imageFile) {
        const uploadResponse = await uploadImage(imageFile);
        finalImageUrl = uploadResponse.data.imageUrl;
      }

      const finalData = { ...formData, profileImageUrl: finalImageUrl };
      const response = await updateMyProfile(finalData);

      toast.success(response.data.message);
      setFormData(finalData);
      setImagePreview(finalImageUrl);

    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل التحديث.');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (loading || !formData) {
    return <Spinner />;
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-neutral-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* قسم الصورة الشخصية */}
        <div className="flex flex-col items-center space-y-4">
          <img
            src={imagePreview || `https://ui-avatars.com/api/?name=${formData.name}&background=E0F2F1&color=00796B&size=128`}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-sm"
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
            className="cursor-pointer text-sm font-semibold text-primary hover:text-primary-dark"
          >
            تغيير الصورة
          </label>
        </div>

        {/* باقي حقول النموذج */}
        <div>
          <label className="text-sm font-medium text-neutral-700">الاسم</label>
          <input name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full p-2.5 border border-neutral-200 rounded-lg focus:ring-primary focus:border-primary" />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700">البريد الإلكتروني</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full p-2.5 border border-neutral-200 rounded-lg focus:ring-primary focus:border-primary" />
        </div>

        {formData.role === 'STUDENT' && (
          <>
            <div>
              <label className="text-sm font-medium text-neutral-700">اسم المدرسة</label>
              <input name="schoolName" value={formData.schoolName || ''} onChange={handleChange} className="mt-1 w-full p-2.5 border border-neutral-200 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700">المرحلة الدراسية</label>
              <input name="gradeLevel" value={formData.gradeLevel || ''} onChange={handleChange} className="mt-1 w-full p-2.5 border border-neutral-200 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700">نبذة تعريفية</label>
              <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows="3" className="mt-1 w-full p-2.5 border border-neutral-200 rounded-lg focus:ring-primary focus:border-primary"></textarea>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-lg shadow-sm transition-all duration-200 disabled:bg-gray-400"
        >
          {uploading ? 'جاري الحفظ...' : 'تحديث الملف الشخصي'}
        </button>
      </form>
    </div>
  );
}

export default ProfileEditor;

