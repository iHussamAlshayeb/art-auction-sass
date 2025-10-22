import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createArtwork, uploadImage } from '../services/api.js';
import toast from 'react-hot-toast';

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

    if (!formData.imageFile) {
      toast.error("الرجاء اختيار صورة.");
      return;
    }

    try {
      // رفع الصورة أولاً إلى Cloudinary
      const uploadRes = await uploadImage(formData.imageFile);
      const imageUrl = uploadRes.data.url;

      // إرسال البيانات إلى السيرفر
      const artworkRes = await axios.post("/api/v1/artworks", {
        title: formData.title,
        description: formData.description,
        imageUrl, // ✅ هذا ضروري
      });

      toast.success("تم رفع العمل الفني بنجاح!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "حدث خطأ في الرفع.");
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-lg space-y-8 bg-white/90 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-xl border border-neutral-200">
        <div>
          <h2 className="text-center text-4xl font-extrabold tracking-tight text-primary-dark">
            إضافة عمل فني جديد
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-700">
            ارفع تحفتك الفنية ليراها العالم
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700">عنوان العمل الفني</label>
              <input
                name="title" type="text" required
                className="mt-1 w-full p-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="مثال: غروب الصحراء"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700">وصف العمل الفني</label>
              <textarea
                name="description" required rows="4"
                className="mt-1 w-full p-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="صف عملك الفني..."
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                صورة العمل الفني
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg"
                required
                className="mt-1 block w-full text-sm text-neutral-700
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary/10 file:text-primary-dark
                  hover:file:bg-primary/20"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-5 rounded-lg shadow-md transition-all duration-200 disabled:bg-gray-400"
            >
              {uploading ? 'جاري الرفع...' : 'إرسال العمل الفني'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateArtworkPage;

