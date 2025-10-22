import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { getMyProfile, getUnreadNotifCount } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import MyArtworksList from "../components/MyArtworksList";
import ActiveBids from "../components/ActiveBids";
import WonArtworks from "../components/WonArtworks";
import { Palette, Award, ClipboardCheck, Bell } from "lucide-react";

function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // 🧠 جلب بيانات المستخدم
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, notifRes] = await Promise.all([
          getMyProfile(),
          getUnreadNotifCount(),
        ]);
        setProfile(profileRes.data.user);
        setUnreadCount(notifRes.data.count || 0);
      } catch (err) {
        console.error("فشل في جلب البيانات:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔔 Socket.io: تحديث عداد الإشعارات لحظيًا
  useEffect(() => {
    if (!user?.id) return;

    const socket = io(import.meta.env.VITE_API_URL || "https://api.fanan3.com", {
      auth: { token: localStorage.getItem("token") },
      transports: ["websocket"],
    });

    socket.on("notification:new", () => {
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, [user?.id]);

  if (loading) return <Spinner />;
  if (!profile)
    return <p className="text-center text-gray-500 mt-10">حدث خطأ أثناء تحميل البيانات.</p>;

  const isProfileComplete = profile.schoolName && profile.gradeLevel;

  return (
    <motion.div
      className="space-y-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ===== العنوان العلوي + الإشعارات ===== */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-50 via-white to-teal-50 rounded-3xl border border-orange-100 shadow-md p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-right gap-6">
          <div>
            <motion.h2
              className="text-4xl md:text-5xl font-extrabold text-orange-600 tracking-tight"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              مرحبًا بعودتك، {profile.name} 👋
            </motion.h2>
            <p className="text-neutral-600 text-lg mt-2">
              يسعدنا استمرارك معنا في عرض إبداعاتك الفنية 🌟
            </p>
          </div>

          {/* 🔔 الجرس */}
          <Link
            to="/notifications"
            className="relative inline-flex items-center justify-center bg-white border border-orange-100 shadow-sm rounded-full w-14 h-14 hover:shadow-lg transition-all group"
            title="عرض الإشعارات"
          >
            <Bell size={26} className="text-orange-500 group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </div>

        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-orange-100 rounded-full blur-2xl opacity-40" />
      </div>

      {/* ===== التحقق من اكتمال الملف الشخصي ===== */}
      {!isProfileComplete ? (
        <motion.div
          className="bg-yellow-50 border-2 border-dashed border-yellow-300 p-10 rounded-3xl text-center shadow-inner"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-3xl font-bold text-yellow-800 mb-3">خطوتك التالية 🎯</h3>
          <p className="text-yellow-700 max-w-lg mx-auto leading-relaxed">
            لإظهار أعمالك الفنية ضمن المنصة، يُرجى إكمال ملفك الشخصي بإضافة اسم المدرسة والمرحلة الدراسية.
          </p>
          <Link to="/dashboard/profile">
            <button className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all duration-200 flex items-center gap-2 mx-auto">
              <ClipboardCheck size={18} />
              إكمال الملف الشخصي الآن
            </button>
          </Link>
        </motion.div>
      ) : (
        <>
          {/* ===== أعمالي ===== */}
          <motion.div
            className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-md border border-orange-100 hover:shadow-lg transition-all"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 pb-3">
              <Palette size={22} className="text-orange-500" />
              <h3 className="text-2xl font-bold text-neutral-900">أعمالي الفنية</h3>
            </div>
            <MyArtworksList />
          </motion.div>

          {/* ===== مشاركاتي في المزادات ===== */}
          <motion.div
            className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-md border border-teal-100 hover:shadow-lg transition-all"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 pb-3">
              <Award size={22} className="text-teal-600" />
              <h3 className="text-2xl font-bold text-neutral-900">مشاركاتي في المزادات</h3>
            </div>
            <ActiveBids />
          </motion.div>

          {/* ===== الأعمال الفائزة ===== */}
          <motion.div
            className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-md border border-teal-100 hover:shadow-lg transition-all"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 pb-3">
              <Award size={22} className="text-orange-500" />
              <h3 className="text-2xl font-bold text-neutral-900">الأعمال التي فزت بها 🏆</h3>
            </div>
            <WonArtworks />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default DashboardPage;
