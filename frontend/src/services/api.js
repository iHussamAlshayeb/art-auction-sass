import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://api.fanan3.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// هذا الكود سيعمل قبل إرسال أي طلب
apiClient.interceptors.request.use(
  (config) => {
    // احصل على التوكن من localStorage
    const token = localStorage.getItem("token");
    if (token) {
      // إذا كان التوكن موجودًا، أضفه إلى رأس Authorization
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchAllAuctions = (params) => {
  // params = { search, sortBy, page }
  return apiClient.get("/auctions", { params });
};

export const registerUser = (userData) => {
  return apiClient.post("/auth/register", userData);
};
export const loginUser = (credentials) => {
  return apiClient.post("/auth/login", credentials);
};

export const createArtwork = (artworkData) => {
  return apiClient.post("/artworks", artworkData);
};

// دالة لجلب أعمال الطالب المسجل دخوله
export const getMyArtworks = () => {
  return apiClient.get("/users/me/artworks");
};

// دالة لإنشاء مزاد جديد
export const createAuction = (auctionData) => {
  // auctionData هو كائن يحتوي على artworkId, startPrice, endTime
  return apiClient.post("/auctions", auctionData);
};

export const fetchAuctionById = (id) => {
  return apiClient.get(`/auctions/${id}`);
};

export const placeBid = (id, amount) => {
  return apiClient.post(`/auctions/${id}/bids`, { amount });
};

export const getMyActiveBids = () => apiClient.get("/users/me/bids");
export const getMyWonArtworks = () => apiClient.get("/users/me/wins");
export const createPayment = (auctionId) =>
  apiClient.post(`/auctions/${auctionId}/checkout`);

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("image", file); // 'image' يجب أن تطابق الاسم في الخادم

  return apiClient.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // مهم جدًا لرفع الملفات
    },
  });
};

export const fetchAuctionBids = (id) => {
  return apiClient.get(`/auctions/${id}/bids`);
};

export const cancelAuction = (auctionId) => {
  return apiClient.delete(`/auctions/${auctionId}`);
};

export const getMyProfile = () => apiClient.get("/users/me");
export const updateMyProfile = (profileData) =>
  apiClient.put("/users/me", profileData);
export const updateMyPassword = (passwordData) =>
  apiClient.put("/users/me/password", passwordData);

export const getAdminStats = () => apiClient.get("/admin/stats");
export const getAllUsers = () => apiClient.get("/admin/users");

export const updateUserRole = (userId, role) =>
  apiClient.put(`/admin/users/${userId}/role`, { role });
export const deleteUser = (userId) =>
  apiClient.delete(`/admin/users/${userId}`);
