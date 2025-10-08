import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://art-auction-api-0kqg.onrender.com/api/v1', // ❗️ استبدل هذا بالرابط الحقيقي الخاص بك
  headers: {
    'Content-Type': 'application/json',
  },
});

// دالة لجلب كل المزادات
export const fetchAllAuctions = () => {
  return apiClient.get('/auctions');
};