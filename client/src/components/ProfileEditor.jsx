import { useState } from 'react';
import { updateMyProfile } from '../services/api';

function ProfileEditor({ user }) {
  const [formData, setFormData] = useState({ name: user.name, email: user.email });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateMyProfile(formData);
      setMessage({ type: 'success', text: response.data.message });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed.' });
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" />
      <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" />
      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">Update Profile</button>
      {message && <p className={message.type === 'success' ? 'text-green-600' : 'text-red-600'}>{message.text}</p>}
    </form>
  );
}
export default ProfileEditor;