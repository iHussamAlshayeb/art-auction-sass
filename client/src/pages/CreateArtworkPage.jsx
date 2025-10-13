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
      setError('Please select an image file to upload.');
      return;
    }
    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      // 1. Upload the image first
      const uploadResponse = await uploadImage(imageFile);
      const finalImageUrl = uploadResponse.data.imageUrl;

      // 2. Use the returned URL to create the artwork
      await createArtwork({ ...formData, imageUrl: finalImageUrl });
      
      setSuccess('Artwork added successfully! Redirecting to your dashboard...');
      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add artwork.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Add a New Artwork
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Upload your masterpiece for the world to see
          </p>
        </div>
        
        {success ? (
          <p className="text-center text-green-600">{success}</p>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md">
              <input
                name="title" type="text" required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Artwork Title"
                onChange={handleChange}
              />
              <textarea
                name="description" required rows="4"
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Artwork Description"
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Artwork Image
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
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={uploading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
              >
                {uploading ? 'Uploading...' : 'Submit Artwork'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateArtworkPage;