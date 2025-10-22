import Notification from "../models/notification.model.js";

/* ================================
   📩 جلب إشعارات المستخدم الحالي
================================ */
export const getNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({
      message: "فشل في جلب الإشعارات",
      error: error.message,
    });
  }
};

/* ================================
   ✅ تحديد كل الإشعارات كمقروءة
================================ */
export const markAllAsRead = async (req, res) => {
  const userId = req.user.id;
  try {
    await Notification.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "تم تحديد الكل كمقروء." });
  } catch (error) {
    res.status(500).json({
      message: "فشل في تحديث الإشعارات",
      error: error.message,
    });
  }
};

/* ================================
   ❌ حذف إشعار محدد
================================ */
export const deleteNotification = async (req, res) => {
  const userId = req.user.id;
  const { id: notificationId } = req.params;

  try {
    const notification = await Notification.findById(notificationId);

    if (!notification)
      return res.status(404).json({ message: "الإشعار غير موجود." });

    if (notification.user.toString() !== userId)
      return res.status(403).json({ message: "غير مصرح لك بحذف هذا الإشعار." });

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: "تم حذف الإشعار بنجاح." });
  } catch (error) {
    res.status(500).json({
      message: "فشل في حذف الإشعار",
      error: error.message,
    });
  }
};

/* ================================
   🧹 حذف جميع الإشعارات
================================ */
export const deleteAllNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    await Notification.deleteMany({ user: userId });
    res.status(200).json({ message: "تم حذف جميع الإشعارات بنجاح." });
  } catch (error) {
    res.status(500).json({
      message: "فشل في حذف جميع الإشعارات",
      error: error.message,
    });
  }
};

/* ================================
   🔔 إنشاء إشعار جديد (بث لحظي)
================================ */
export const createNotification = async (req, res) => {
  const { userId, message, link } = req.body;
  try {
    if (!userId || !message) {
      return res.status(400).json({ message: "الحقول مطلوبة." });
    }

    const notification = await Notification.create({
      user: userId,
      message,
      link: link || null,
    });

    // ⚡️ بثّ الإشعار للمستخدم عبر Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(`user-${userId}`).emit("notification:new", notification);
    }

    res.status(201).json({ message: "تم إرسال الإشعار.", notification });
  } catch (error) {
    res.status(500).json({
      message: "فشل في إنشاء الإشعار",
      error: error.message,
    });
  }
};

/* ================================
   🔢 عدد الإشعارات غير المقروءة
================================ */
export const getUnreadNotificationsCount = async (req, res) => {
  const userId = req.user.id;
  try {
    const count = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({
      message: "فشل في جلب عدد الإشعارات",
      error: error.message,
    });
  }
};
