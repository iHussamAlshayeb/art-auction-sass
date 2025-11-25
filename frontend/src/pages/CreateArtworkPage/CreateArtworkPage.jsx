import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createArtwork, uploadImage } from '../../services/api.js';
import toast from 'react-hot-toast';
import RateLimitedUI from '../../components/ui/RateLimitedUI.jsx'
import { ArrowLeftIcon } from 'lucide-react';


import './CreateArtworkPage.css'

function CreateArtworkPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);



  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile || !title.trim() || !description.trim()) {
      toast.error("يرجى ملئ جميع الحقول, واعادة المحاولة");
      return;
    }

    setLoading(true);

    try {
      const uploadResponse = await uploadImage(imageFile);
      const finalImageUrl = uploadResponse.data.url;

      await createArtwork({ title, description, imageUrl: finalImageUrl });

      toast.success('تمت إضافة العمل الفني بنجاح!');
      setIsRateLimited(false)
      navigate('/dashboard/my-artworks');

    } catch (error) {
      console.error(error.response?.data?.message || 'فشلت إضافة العمل الفني.');
      if (error.response.status === 429) {
        setIsRateLimited(true)
        toast.error("شوي شوي, انتظر شوي وحاول من جديد", {
          duration: 4000, // 4 seconds
          icon: "💀"
        })
      } else {
        toast.error("فشلت إضافة العمل الفني, حاول مجددا لاحقا!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen ">
      {isRateLimited && <RateLimitedUI />}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link to={"/gallery"} className="btn btn-ghost mb-6 text-primary-dark">
            <ArrowLeftIcon className="size-5" />
            العودة للأعمال
          </Link>

          <div className="card bg-white/90 backdrop-blur-sm border border-neutral-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-3xl font-extrabold text-primary-dark mb-2 text-center">
                إضافة عمل فني جديد
              </h2>
              <p className="text-center text-sm text-neutral-700 mb-6">
                ارفع تحفتك الفنية ليراها العالم
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-control mb-6 space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text text-neutral-700 font-medium">
                        عنوان العمل الفني
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: غروب الصحراء"
                      className="input input-bordered w-full focus:ring-2 focus:ring-primary"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text text-neutral-700 font-medium">
                        وصف العمل الفني
                      </span>
                    </label>
                    <textarea
                      placeholder="صف عملك الفني..."
                      className="textarea textarea-bordered w-full h-32 focus:ring-2 focus:ring-primary"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text text-neutral-700 font-medium">
                        صورة العمل الفني
                      </span>
                    </label>
                    <input
                      type="file"
                      onChange={(e) =>
                        e.target.files.length > 0
                          ? setImageFile(e.target.files[0])
                          : ""
                      }
                      accept="image/png, image/jpeg, image/jpg"
                      className="file-input file-input-bordered w-full text-neutral-700
                    file:bg-primary/10 file:text-primary-dark hover:file:bg-primary/20"
                    />
                  </div>
                </div>

                <div className="card-actions justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full font-bold text-white shadow-md transition-all duration-200 disabled:bg-gray-400"
                  >
                    {loading ? "جاري الرفع..." : "إرسال العمل الفني"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>)
}

export default CreateArtworkPage;

