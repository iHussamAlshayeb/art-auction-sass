import PrismaClientPkg from "@prisma/client";
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();

export const getAllStudents = async (req, res) => {
  // 1. الحصول على متغيرات ترقيم الصفحات من الرابط، مع قيم افتراضية
  const { page = 1, limit = 16 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum; // حساب عدد السجلات التي يجب تخطيها

  try {
    // 2. جلب قائمة الطلاب للصفحة الحالية
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" }, // فلترة النتائج لتشمل الطلاب فقط
      skip: skip,
      take: limitNum,
      orderBy: { createdAt: "desc" }, // ترتيبهم من الأحدث للأقدم
      select: {
        id: true,
        name: true,
        profileImageUrl: true,
        schoolName: true,
        gradeLevel: true,
        _count: {
          // 3. حساب عدد السجلات المرتبطة بكفاءة
          select: { artworks: true }, // حساب عدد الأعمال الفنية لكل طالب
        },
      },
    });

    // 4. جلب العدد الإجمالي للطلاب لحساب عدد الصفحات
    const totalStudents = await prisma.user.count({
      where: { role: "STUDENT" },
    });
    const totalPages = Math.ceil(totalStudents / limitNum);

    // 5. إرسال الرد مع قائمة الطلاب ومعلومات ترقيم الصفحات
    res.status(200).json({
      students,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch students", error: error.message });
  }
};
// دالة لجلب الملف الشخصي العام للطالب وأعماله
export const getStudentPublicProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await prisma.user.findUnique({
      where: {
        id: id,
        role: "STUDENT",
      },
      select: {
        id: true,
        name: true,
        schoolName: true,
        gradeLevel: true,
        bio: true,
        profileImageUrl: true,
        artworks: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            auction: {
              select: {
                id: true,
                currentPrice: true,
                endTime: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.status(200).json({ student });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student profile",
      error: error.message,
    });
  }
};
