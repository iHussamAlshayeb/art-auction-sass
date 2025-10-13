import { useState } from 'react';
import { updateMyPassword } from '../services/api';

function PasswordEditor() {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} placeholder="Current Password" required className="w-full p-2 border rounded" />
      <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="New Password" required className="w-full p-2 border rounded" />
      <button type="submit" className="bg-gray-700 text-white py-2 px-4 rounded">Change Password</button>
      {message && <p className={message.type === 'success' ? 'text-green-600' : 'text-red-600'}>{message.text}</p>}
    </form>
  );
}
export default PasswordEditor;