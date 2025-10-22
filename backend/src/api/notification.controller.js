import Notification from "../models/notification.model.js";

/* ======================================================
   🔔 جلب كل الإشعارات الخاصة بالمستخدم
====================================================== */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({
      message: "فشل في جلب الإشعارات",
      error: error.message,
    });
  }
};

/* ======================================================
   ✅ تحديد جميع الإشعارات كمقروءة
====================================================== */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id }, { read: true });
    res.status(200).json({ message: "تم تحديد جميع الإشعارات كمقروءة." });
  } catch (error) {
    res.status(500).json({
      message: "فشل في تحديد جميع الإشعارات كمقروءة.",
      error: error.message,
    });
  }
};

/* ======================================================
   ✅ تحديد إشعار واحد كمقروء
====================================================== */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notif = await Notification.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ message: "الإشعار غير موجود." });
    }

    res.status(200).json({ message: "تم تحديد الإشعار كمقروء." });
  } catch (error) {
    res.status(500).json({
      message: "فشل في تحديد الإشعار كمقروء.",
      error: error.message,
    });
  }
};

/* ======================================================
   🗑️ حذف إشعار واحد أو الكل
====================================================== */
export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    // 🧹 حذف الكل
    if (id === "all") {
      await Notification.deleteMany({ user: req.user.id });
      return res.status(200).json({ message: "تم حذف جميع الإشعارات." });
    }

    // ❌ حذف واحد
    const notif = await Notification.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!notif) {
      return res.status(404).json({ message: "الإشعار غير موجود." });
    }

    res.status(200).json({ message: "تم حذف الإشعار بنجاح." });
  } catch (error) {
    res.status(500).json({
      message: "فشل في حذف الإشعار.",
      error: error.message,
    });
  }
};

/* ======================================================
   🧹 حذف جميع الإشعارات (عند استدعاء DELETE /)
====================================================== */
export const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.status(200).json({ message: "تم حذف جميع الإشعارات." });
  } catch (error) {
    res.status(500).json({
      message: "فشل في حذف جميع الإشعارات.",
      error: error.message,
    });
  }
};

/* ======================================================
   🆕 إنشاء إشعار جديد (مثلاً عند بيع عمل فني)
====================================================== */
export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: "الحقول المطلوبة ناقصة." });
    }

    const newNotif = await Notification.create({
      user: userId,
      title: title || "إشعار جديد",
      message,
      type: type || "info",
    });

    // 🧠 إرسال إشعار لحظي عبر Socket.io
    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");
    const socketId = userSocketMap.get(userId.toString());

    if (io && socketId) {
      io.to(socketId).emit("notification:new", newNotif);
    }

    res.status(201).json({
      message: "تم إنشاء الإشعار بنجاح.",
      notification: newNotif,
    });
  } catch (error) {
    res.status(500).json({
      message: "فشل في إنشاء الإشعار.",
      error: error.message,
    });
  }
};

/* ======================================================
   🔢 عدد الإشعارات غير المقروءة
====================================================== */
export const getUnreadNotificationsCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      read: false,
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({
      message: "فشل في جلب عدد الإشعارات غير المقروءة.",
      error: error.message,
    });
  }
};
