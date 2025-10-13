import { useState } from 'react';
import { updateMyProfile } from '../services/api';

function ProfileEditor({ user }) {
  const [formData, setFormData] = useState({ name: user.name, email: user.email });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
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
      <div>
        <label className="text-sm font-medium text-gray-600">الاسم</label>
        <input name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-600">البريد الإلكتروني</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
      </div>
      <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all duration-200">تحديث الملف الشخصي</button>
      {message && <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>}
    </form>
  );
}
export default ProfileEditor;