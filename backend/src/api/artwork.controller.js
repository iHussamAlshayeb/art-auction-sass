import PrismaClientPkg from "@prisma/client";
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();

// Controller to create a new artwork
export const createArtwork = async (req, res) => {
  const { title, description, imageUrl } = req.body;
  const studentId = req.user.id; // From the 'protect' middleware

  if (!title || !description || !imageUrl) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newArtwork = await prisma.artwork.create({
      data: {
        title,
        description,
        imageUrl,
        student: {
          connect: { id: studentId },
        },
      },
    });
    res
      .status(201)
      .json({ message: "Artwork created successfully", artwork: newArtwork });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create artwork", error: error.message });
  }
};

export const getAllArtworks = async (req, res) => {
  try {
    const artworks = await prisma.artwork.findMany({
      orderBy: {
        createdAt: "desc", // Show newest first
      },
      include: {
        student: {
          // Include the related student's info
          select: {
            name: true, // Only select the student's name
          },
        },
      },
    });
    res.status(200).json({ artworks });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch artworks", error: error.message });
  }
};

export const getPublicArtworks = async (req, res) => {
  const { page = 1, limit = 12 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  try {
    // جلب الأعمال الفنية للصفحة الحالية
    const artworks = await prisma.artwork.findMany({
      skip: skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          // تضمين معلومات الطالب (الفنان)
          select: {
            id: true,
            name: true,
          },
        },
        auction: {
          // تضمين معلومات المزاد إن وجدت
          select: { id: true },
        },
      },
    });

    // حساب العدد الإجمالي للأعمال الفنية
    const totalArtworks = await prisma.artwork.count();
    const totalPages = Math.ceil(totalArtworks / limitNum);

    res.status(200).json({
      artworks,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch artworks", error: error.message });
  }
};
