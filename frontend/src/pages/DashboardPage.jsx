import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getMyProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import MyArtworksList from "../components/MyArtworksList";
import ActiveBids from "../components/ActiveBids";
import WonArtworks from "../components/WonArtworks";
import { Palette, Award, ClipboardCheck } from "lucide-react";

function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧠 جلب بيانات الطالب
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        setProfile(res.data.user);
      } catch (err) {
        console.error("فشل في جلب الملف الشخصي:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <Spinner />;
  if (!profile) return <p className="text-center text-gray-500 mt-10">حدث خطأ أثناء تحميل البيانات.</p>;

  const isProfileComplete = profile.schoolName && profile.gradeLevel;

  return (
    <motion.div
      className="space-y-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ===== قسم الترحيب ===== */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-50 via-white to-teal-50 rounded-3xl border border-orange-100 shadow-md p-8 text-center">
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

          {/* ===== العروض النشطة ===== */}
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
