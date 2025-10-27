import Notification from "../models/notification.model.js";

/* ======================================================
   🔔 جلب الإشعارات الخاصة بالمستخدم الحالي
====================================================== */
export async function getNotifications(req, res) {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({
      message: "فشل في جلب الإشعارات",
      error: error.message,
    });
  }
}

/* ======================================================
   ✅ تحديد إشعار واحد كمقروء
====================================================== */
export async function markAsRead(req, res) {
  try {
    const { notificationId } = req.body;
    const userId = req.user.id;

    if (!notificationId) {
      return res.status(400).json({ message: "لم يتم تحديد الإشعار." });
    }

    const notif = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ message: "الإشعار غير موجود." });
    }

    res.status(200).json({ message: "تم تحديد الإشعار كمقروء.", notif });
  } catch (error) {
    res.status(500).json({
      message: "فشل في تحديد الإشعار كمقروء.",
      error: error.message,
    });
  }
}

/* ======================================================
   ✅ تحديد جميع الإشعارات كمقروءة
====================================================== */
export async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;
    await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );
    res.status(200).json({ message: "تم تحديد جميع الإشعارات كمقروءة." });
  } catch (error) {
    res.status(500).json({
      message: "فشل في تحديث الإشعارات.",
      error: error.message,
    });
  }
}

/* ======================================================
   ❌ حذف إشعار واحد
====================================================== */
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notif = await Notification.findOneAndDelete({
      _id: id,
      user: userId,
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
}

/* ======================================================
   🧹 حذف جميع الإشعارات للمستخدم الحالي
====================================================== */
export async function deleteAllNotifications(req, res) {
  try {
    const userId = req.user.id;
    await Notification.deleteMany({ user: userId });
    res.status(200).json({ message: "تم حذف جميع الإشعارات بنجاح." });
  } catch (error) {
    res.status(500).json({
      message: "فشل في حذف جميع الإشعارات.",
      error: error.message,
    });
  }
}

/* ======================================================
   🔢 عدد الإشعارات غير المقروءة
====================================================== */
export async function getUnreadNotificationsCount(req, res) {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({
      user: userId,
      read: false,
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({
      message: "فشل في جلب عدد الإشعارات غير المقروءة.",
      error: error.message,
    });
  }
}

/* ======================================================
   🆕 إنشاء إشعار جديد (للمشرف أو النظام)
   ⚡ يدعم Socket.io — يرسل الإشعار للمستخدم مباشرة في الوقت الحقيقي
====================================================== */
export async function createNotification(req, res) {
  try {
    const { userId, message, link } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ message: "الحقول المطلوبة مفقودة." });
    }

    const newNotif = await Notification.create({
      user: userId,
      message,
      link: link || null,
      read: false,
    });

    // 📡 إرسال الإشعار فورًا للمستخدم المتصل (إن وُجد)
    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");

    const socketId = userSocketMap.get(userId.toString());
    if (io && socketId) {
      io.to(socketId).emit("notification:new", newNotif);
    }

    res
      .status(201)
      .json({ message: "تم إنشاء الإشعار.", notification: newNotif });
  } catch (error) {
    res.status(500).json({
      message: "فشل في إنشاء الإشعار.",
      error: error.message,
    });
  }
}
