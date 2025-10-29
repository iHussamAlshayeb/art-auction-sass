import api from "../lib/axios";

// 🧩 إعداد العميل الأساسي للـ API
const apiClient = api;

// ✅ إضافة التوكن تلقائيًا قبل كل طلب (Interceptor)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

//
// ======================== 🧍‍♂️ المستخدمون & التسجيل ========================
//

// تسجيل مستخدم جديد
export const registerUser = (userData) =>
  apiClient.post("/auth/register", userData);

// تسجيل الدخول
export const loginUser = (credentials) =>
  apiClient.post("/auth/login", credentials);

// تسجيل الخروج (اختياري في الواجهة)
export const logoutUser = () => localStorage.removeItem("token");

// جلب بيانات الحساب الشخصي
export const getMyProfile = () => apiClient.get("/users/me");

// تحديث بيانات الحساب الشخصي
export const updateMyProfile = (profileData) =>
  apiClient.put("/users/me", profileData);

// تحديث كلمة المرور
export const updateMyPassword = (passwordData) =>
  apiClient.put("/users/me/password", passwordData);

//
// ======================== 🎨 الأعمال الفنية ========================
//

// إنشاء عمل فني جديد
export const createArtwork = (artworkData) =>
  apiClient.post("/artworks", artworkData);

// جلب أعمال الطالب المسجل دخوله
export const getMyArtworks = () => apiClient.get("/users/me/artworks");

// جلب جميع الأعمال الفنية (المعرض العام)
export const fetchAllArtworks = (params = {}) => {
  // params يمكن أن تحتوي على { page, search, sortBy }
  return apiClient.get("/artworks", { params });
};

export const fetchArtworksById = (id) => apiClient.get(`/artworks/${id}`);

// جلب أعمال طالب معين (لصفحة بروفايل طالب)
export const getStudentProfile = (studentId) =>
  apiClient.get(`/students/${studentId}`);

// رفع صورة (لأعمال فنية أو بروفايل)
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return apiClient.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

//
// ======================== 🏆 المزادات ========================
//

// جلب جميع المزادات
export const fetchAllAuctions = (params) =>
  apiClient.get("/auctions", { params });

// إنشاء مزاد جديد
export const createAuction = (auctionData) =>
  apiClient.post("/auctions", auctionData);

// جلب مزاد محدد
export const fetchAuctionById = (id) => apiClient.get(`/auctions/${id}`);

// تقديم مزايدة
export const placeBid = (id, amount) =>
  apiClient.post(`/auctions/${id}/bids`, { amount });

// جلب مزايدات مزاد معين
export const fetchAuctionBids = (id) => apiClient.get(`/auctions/${id}/bids`);

// إلغاء مزاد (خاص بصاحب العمل فقط)
export const cancelAuction = (auctionId) =>
  apiClient.delete(`/auctions/${auctionId}`);

// إنشاء دفع (Moyasar)
// 💳 المدفوعات
export const createPayment = (auctionId) =>
  apiClient.post(`/auctions/${auctionId}/checkout`);

export const getMyPayments = () => apiClient.get("/payments/my");

//
// ======================== 📈 لوحة الطالب ========================
//

// المزايدات النشطة الخاصة بالطالب
export const getMyActiveBids = () => apiClient.get("/users/me/bids");

// الأعمال التي فاز بها المستخدم
export const getMyWonArtworks = () => apiClient.get("/users/me/wins");

//
// ======================== 🛠️ لوحة الإدارة ========================
//

// إحصائيات لوحة التحكم
export const getAdminStats = () => apiClient.get("/admin/stats");

// جلب كل المستخدمين
export const getAllUsers = () => apiClient.get("/admin/users");

// تحديث صلاحية مستخدم
export const updateUserRole = (userId, role) =>
  apiClient.put(`/admin/users/${userId}/role`, { role });

// حذف مستخدم
export const deleteUser = (userId) =>
  apiClient.delete(`/admin/users/${userId}`);

// جلب كل الأعمال الفنية للإدارة
export const getAdminArtworks = () => apiClient.get("/admin/artworks");

// حذف عمل فني بواسطة الإدارة
export const deleteArtworkByAdmin = (artworkId) =>
  apiClient.delete(`/admin/artworks/${artworkId}`);

//
// ======================== 🧑‍🎓 الطلاب ========================
//

// جلب قائمة الطلاب
export const fetchAllStudents = (params = {}) => {
  return apiClient.get("/students", { params });
};

//
// ======================== 🔔 الإشعارات ========================
//

// 📨 جلب جميع إشعارات المستخدم
export const getNotifications = () => apiClient.get("/notifications");

// ✅ تحديد كل الإشعارات كمقروءة
export const markAllNotificationsRead = () =>
  apiClient.put("/notifications/mark-all-read");

// ❌ حذف إشعار واحد
export const deleteNotificationById = (notificationId) =>
  apiClient.delete(`/notifications/${notificationId}`);

// 🧹 حذف جميع الإشعارات
export const deleteAllNotifications = () => apiClient.delete("/notifications");

// 🔢 عدد الإشعارات غير المقروءة
export const getUnreadNotifCount = () =>
  apiClient.get("/notifications/unread-count");

// 🆕 إنشاء إشعار جديد (للمشرف أو النظام)
export const createNotification = (notifData) =>
  apiClient.post("/notifications", notifData);

//
// ======================== 🧩 إدارة المزادات (إداري) ========================
//
export const getAllAuctionsAdmin = () => apiClient.get("/admin/auctions");
export const endAuctionManually = (auctionId) =>
  apiClient.post(`/admin/auctions/${auctionId}/end`);
