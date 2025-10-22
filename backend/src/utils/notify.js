// دالة موحّدة: تحاول منع التكرار، تحفظ DB، وتبث عبر Socket.io
import Notification from "../models/notification.model.js";

/**
 * sendUserNotification(io, userSocketMap, { userId, message, link }, { dedupeKey? })
 * - dedupeKey (اختياري): مفتاح لمنع تكرار نفس الإشعار (message + link + user)
 */
export async function sendUserNotification(
  io,
  userSocketMap,
  payload,
  opts = {}
) {
  const { userId, message, link = null } = payload;
  const { dedupeKey } = opts;

  // 1) منع التكرار (اختياري)
  if (dedupeKey) {
    const exists = await Notification.findOne({
      user: userId,
      message,
      link,
    });
    if (exists) {
      // حتى لو موجود، ابثّ عدّاد التحديث عشان تتزامن الواجهة
      emitUnreadCount(io, userSocketMap, userId);
      return exists;
    }
  }

  // 2) أنشئ الإشعار في DB
  const notif = await Notification.create({
    user: userId,
    message,
    link,
    isRead: false,
  });

  // 3) بث فوري إلى صاحب الإشعار (إن كان متصلاً)
  const socketId = userSocketMap.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit("notification:new", {
      _id: notif._id,
      message: notif.message,
      link: notif.link,
      isRead: notif.isRead,
      createdAt: notif.createdAt,
    });
  }

  // 4) بث تحديث العدّاد (حتى لو المستخدم ليس في صفحة الإشعارات)
  await emitUnreadCount(io, userSocketMap, userId);

  return notif;
}

/** يبث عداد غير المقروء للمستخدم المحدد */
export async function emitUnreadCount(io, userSocketMap, userId) {
  const count = await Notification.countDocuments({
    user: userId,
    isRead: false,
  });
  const socketId = userSocketMap.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit("notification:unreadCount", { count });
  }
}
