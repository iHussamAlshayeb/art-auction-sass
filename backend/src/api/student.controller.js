import PrismaClientPkg from "@prisma/client";
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();

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
