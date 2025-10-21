import Notification from "../models/notification.model.js"; // 1. استيراد نموذج Mongoose

// ---== دالة جلب الإشعارات (نسخة Mongoose) ==---
export const getNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 }) // -1 تعادل 'desc'
      .limit(30); // .limit تعادل 'take'

    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب الإشعارات" });
  }
};

// ---== دالة تحديد الكل كمقروء (نسخة Mongoose) ==---
export const markAllAsRead = async (req, res) => {
  const userId = req.user.id;
  try {
    // 2. استخدام updateMany مع $set
    await Notification.updateMany(
      { user: userId, isRead: false }, // الشرط
      { $set: { isRead: true } } // التحديث
    );
    res.status(200).json({ message: "تم تحديد الكل كمقروء." });
  } catch (error) {
    res.status(500).json({ message: "فشل في تحديث الإشعارات" });
  }
};

// ---== دالة حذف إشعار (نسخة Mongoose) ==---
export const deleteNotification = async (req, res) => {
  const userId = req.user.id;
  const { id: notificationId } = req.params;
  try {
    // 3. العثور على الإشعار
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "الإشعار غير موجود." });
    }

    // 4. فحص أمني: التأكد من أن المستخدم يملك هذا الإشعار
    // Mongoose IDs هي objects، لذا نستخدم .toString() للمقارنة
    if (notification.user.toString() !== userId) {
      return res.status(403).json({ message: "غير مصرح لك" });
    }

    // 5. حذف الإشعار
    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: "تم حذف الإشعار." });
  } catch (error) {
    res.status(500).json({ message: "فشل في حذف الإشعار" });
  }
};

// ---== دالة جلب عدد الإشعارات غير المقروءة (نسخة Mongoose) ==---
export const getUnreadNotificationsCount = async (req, res) => {
  const userId = req.user.id;
  try {
    // 6. استخدام countDocuments
    const count = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب عدد الإشعارات" });
  }
};
