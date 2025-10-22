import Notification from "../models/notification.model.js";

/**
 * 🔔 جلب إشعارات المستخدم الحالي (مع دعم التصفح)
 * query: page, limit
 */
export const getNotifications = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20"), 1), 50);
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ user: req.user.id }),
    ]);

    res.status(200).json({
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
        total,
      },
    });
  } catch (error) {
    console.error("getNotifications error:", error);
    res
      .status(500)
      .json({ message: "فشل في جلب الإشعارات", error: error.message });
  }
};

/**
 * 📖 تعليم جميع الإشعارات كمقروءة
 * POST /notifications/mark-read
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "تم تعليم جميع الإشعارات كمقروءة." });
  } catch (error) {
    console.error("markAllAsRead error:", error);
    res
      .status(500)
      .json({ message: "فشل في تحديث الإشعارات", error: error.message });
  }
};

/**
 * 🗑️ حذف إشعار واحد
 * DELETE /notifications/:id
 */
export const deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!notif) {
      return res.status(404).json({ message: "الإشعار غير موجود." });
    }
    res.status(200).json({ message: "تم حذف الإشعار بنجاح." });
  } catch (error) {
    console.error("deleteNotification error:", error);
    res
      .status(500)
      .json({ message: "فشل في حذف الإشعار", error: error.message });
  }
};

/**
 * 🔢 عدد الإشعارات غير المقروءة
 * GET /notifications/unread-count
 */
export const getUnreadNotificationsCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });
    res.status(200).json({ count });
  } catch (error) {
    console.error("getUnreadNotificationsCount error:", error);
    res
      .status(500)
      .json({ message: "فشل في جلب عدد الإشعارات", error: error.message });
  }
};
