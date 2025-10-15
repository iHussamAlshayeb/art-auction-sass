import PrismaClientPkg from "@prisma/client";
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();

export const getAllStudents = async (req, res) => {
  const { page = 1, limit = 16 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      skip: skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        profileImageUrl: true,
        schoolName: true,
        gradeLevel: true,
        _count: {
          select: { artworks: true },
        },
      },
    });

    const totalStudents = await prisma.user.count({
      where: { role: "STUDENT" },
    });
    const totalPages = Math.ceil(totalStudents / limitNum);

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
