import PrismaClientPkg from "@prisma/client";
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();

export const getNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// ---== دالة جديدة: تحديد الكل كمقروء ==---
export const markAllAsRead = async (req, res) => {
  const userId = req.user.id;
  try {
    await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });
    res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notifications as read" });
  }
};

// ---== دالة جديدة: حذف إشعار ==---
export const deleteNotification = async (req, res) => {
  const userId = req.user.id;
  const { id: notificationId } = req.params;
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    // فحص أمني: التأكد من أن المستخدم يملك هذا الإشعار
    if (notification.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });
    res.status(200).json({ message: "Notification deleted." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete notification" });
  }
};
