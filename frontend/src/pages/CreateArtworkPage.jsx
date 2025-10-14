import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createArtwork, uploadImage } from '../services/api';

function CreateArtworkPage() {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError('الرجاء اختيار ملف صورة لرفعه.');
      return;
    }
    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      // 1. ارفع الصورة أولاً
      const uploadResponse = await uploadImage(imageFile);
      const finalImageUrl = uploadResponse.data.imageUrl;

      // 2. استخدم الرابط لإنشاء العمل الفني
      await createArtwork({ ...formData, imageUrl: finalImageUrl });
      
      setSuccess('تمت إضافة العمل بنجاح! جاري توجيهك...');
      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'فشلت إضافة العمل الفني.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-6 sm:px-10 bg-gradient-to-b from-orange-50 via-white to-orange-50 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg space-y-8 bg-white/90 backdrop-blur-sm p-8 sm:p-10 rounded-3xl shadow-lg border border-orange-100">
        <div>
          <h2 className="text-center text-4xl font-extrabold tracking-tight text-orange-600">
            إضافة عمل فني جديد
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ارفع تحفتك الفنية ليراها العالم
          </p>
        </div>
        
        {success ? (
          <p className="text-center text-lg text-green-600">{success}</p>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">عنوان العمل الفني</label>
                <input
                  name="title" type="text" required
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  placeholder="مثال: غروب الصحراء"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">وصف العمل الفني</label>
                <textarea
                  name="description" required rows="4"
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  placeholder="صف عملك الفني..."
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  صورة العمل الفني
                </label>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept="image/png, image/jpeg, image/jpg" 
                  required
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-orange-50 file:text-orange-700
                    hover:file:bg-orange-100"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-5 rounded-xl shadow-sm transition-all duration-200 disabled:bg-gray-400"
              >
                {uploading ? 'جاري الرفع...' : 'إرسال العمل الفني'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateArtworkPage;