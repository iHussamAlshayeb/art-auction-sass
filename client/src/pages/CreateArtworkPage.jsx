import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createArtwork, uploadImage } from '../services/api';


function CreateArtworkPage() {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
     e.preventDefault();
    if (!imageFile) {
      setError('Please select an image to upload.');
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
      setSuccess('Artwork added successfully! Redirecting to your dashboard...');
      
      // انتظر ثانيتين ثم أعد التوجيه
      setTimeout(() => {navigate('/dashboard');}, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add artwork.');
    }finally {
      setUploading(false);
    }
  };

  
  return (
    <div>
      <h2>Add a New Artwork</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', margin: 'auto' }}>
        <input type="text" name="title" placeholder="Artwork Title" onChange={handleChange} required />
        <textarea name="description" placeholder="Artwork Description" onChange={handleChange} required rows="4"></textarea>
        <label>Artwork Image:</label>        
        <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg" required />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading Image...' : 'Submit Artwork'}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: '1rem' }}>{success}</p>}
    </div>
  );
}

export default CreateArtworkPage;