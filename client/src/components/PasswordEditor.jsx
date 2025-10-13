import { useState } from 'react';
import { updateMyPassword } from '../services/api';

function PasswordEditor() {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await updateMyPassword(formData);
      setMessage({ type: 'success', text: response.data.message });
      setFormData({ currentPassword: '', newPassword: '' }); // Clear fields
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed.' });
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-600">كلمة المرور الحالية</label>
        <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} placeholder="••••••••" required className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-600">كلمة المرور الجديدة</label>
        <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="••••••••" required className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
      </div>
      <button type="submit" className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all duration-200">تغيير كلمة المرور</button>
      {message && <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>}
    </form>
  );
}
export default PasswordEditor;