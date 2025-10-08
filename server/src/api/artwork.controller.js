import PrismaClientPkg from '@prisma/client';
const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();

// Controller to create a new artwork
export const createArtwork = async (req, res) => {
  const { title, description, imageUrl } = req.body;
  const studentId = req.user.id; // From the 'protect' middleware

  if (!title || !description || !imageUrl) {
    return res.status(400).json({ message: 'All fields are required' });
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
    res.status(201).json({ message: 'Artwork created successfully', artwork: newArtwork });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create artwork', error: error.message });
  }
};


export const getAllArtworks = async (req, res) => {
  try {
    const artworks = await prisma.artwork.findMany({
      orderBy: {
        createdAt: 'desc', // Show newest first
      },
      include: {
        student: { // Include the related student's info
          select: {
            name: true, // Only select the student's name
          },
        },
      },
    });
    res.status(200).json({ artworks });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch artworks', error: error.message });
  }
};