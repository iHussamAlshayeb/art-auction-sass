import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.fanan3.com/api/v1",
  withCredentials: true,
});

// ✅ إضافة الـ Token تلقائيًا إلى كل طلب
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* =========================================================
   🧩 مسارات المستخدم / المصادقة
========================================================= */
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getProfile = () => API.get("/auth/profile");

/* =========================================================
   🖼️ رفع الصور
========================================================= */
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return API.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/* =========================================================
   🎨 الأعمال الفنية
========================================================= */
export const createArtwork = (data) => API.post("/artworks", data);
export const updateArtwork = (id, data) => API.put(`/artworks/${id}`, data);
export const deleteArtwork = (id) => API.delete(`/artworks/${id}`);
export const getAllArtworks = () => API.get("/artworks");
export const getStudentArtworks = (studentId) =>
  API.get(`/artworks/student/${studentId}`);

/* =========================================================
   💰 المزادات
========================================================= */
export const fetchAllAuctions = (params = {}) =>
  API.get("/auctions", { params });

export const createAuction = (data) => API.post("/auctions", data);
export const getAuctionById = (id) => API.get(`/auctions/${id}`);
export const placeBid = (data) => API.post("/bids", data);

/* =========================================================
   🔔 الإشعارات
========================================================= */

// 📩 جلب كل إشعارات المستخدم
export const getNotifications = () => API.get("/notifications");

// ✅ تحديد كل الإشعارات كمقروءة
export const markAllNotificationsRead = () =>
  API.put("/notifications/mark-all-read");

// ❌ حذف إشعار واحد
export const deleteNotificationById = (id) =>
  API.delete(`/notifications/${id}`);

// 🧹 حذف جميع الإشعارات
export const deleteAllNotifications = () => API.delete("/notifications");

// 🔢 عدد الإشعارات غير المقروءة
export const getUnreadNotificationsCount = () =>
  API.get("/notifications/unread-count");

// 🆕 إنشاء إشعار جديد (للمشرف أو النظام)
export const createNotification = (data) => API.post("/notifications", data);

/* =========================================================
   🧑‍💼 الإدارة (Admin)
========================================================= */
export const getAdminStats = () => API.get("/admin/stats");
export const getAllUsers = () => API.get("/admin/users");
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const updateUserRole = (id, role) =>
  API.put(`/admin/users/${id}`, { role });

export const getAdminArtworks = () => API.get("/admin/artworks");
export const deleteArtworkByAdmin = (id) => API.delete(`/admin/artworks/${id}`);

export const getAdminNotifications = () => API.get("/admin/notifications");
export const deleteNotificationByAdmin = (id) =>
  API.delete(`/admin/notifications/${id}`);

export default API;
