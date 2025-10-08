import PrismaClientPkg from '@prisma/client';
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();

// This is the getMyProfile function we already have
export const getMyProfile = (req, res) => {
  res.status(200).json({
    message: 'Profile fetched successfully',
    user: req.user,
  });
};

// Add this new function to user.controller.js
export const getMyArtworks = async (req, res) => {
  const studentId = req.user.id; // From the 'protect' middleware

  try {
    const artworks = await prisma.artwork.findMany({
      where: {
        studentId: studentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json({ artworks });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your artworks', error: error.message });
  }
};