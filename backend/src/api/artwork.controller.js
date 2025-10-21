import mongoose from "mongoose";
import Artwork from "../models/artwork.model.js";

// ---== إنشاء عمل فني ==---
export const createArtwork = async (req, res) => {
  const { title, description, imageUrl } = req.body;
  const studentId = req.user.id;

  if (!title || !description || !imageUrl) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ message: "Invalid student ID." });
  }

  try {
    const newArtwork = await Artwork.create({
      title,
      description,
      imageUrl,
      student: studentId,
    });

    res.status(201).json({
      message: "Artwork created successfully",
      artwork: {
        ...newArtwork.toObject(),
        id: newArtwork._id, // ✅ توحيد الحقل
      },
    });
  } catch (error) {
    console.error("Error creating artwork:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        error: error.message,
      });
    }
    res.status(500).json({
      message: "Failed to create artwork",
      error: error.message,
    });
  }
};

// ---== جلب كل الأعمال الفنية (للإدارة مثلاً) ==---
export const getAllArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find()
      .sort({ createdAt: -1 })
      .populate("student", "_id name schoolName")
      .lean();

    const formattedArtworks = artworks.map((art) => ({
      ...art,
      id: art._id,
      student: art.student ? { ...art.student, id: art.student._id } : null,
    }));

    res.status(200).json({ artworks: formattedArtworks });
  } catch (error) {
    console.error("Error fetching artworks:", error);
    res.status(500).json({
      message: "Failed to fetch artworks",
      error: error.message,
    });
  }
};

// ---== جلب الأعمال الفنية العامة (لواجهة المعرض) ==---
export const getPublicArtworks = async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  try {
    const artworks = await Artwork.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("student", "_id name schoolName")
      .populate("auction", "_id currentPrice endTime")
      .lean();

    const formattedArtworks = artworks.map((art) => ({
      ...art,
      id: art._id,
      student: art.student ? { ...art.student, id: art.student._id } : null,
      auction: art.auction ? { ...art.auction, id: art.auction._id } : null,
    }));

    const totalArtworks = await Artwork.countDocuments();
    const totalPages = Math.ceil(totalArtworks / limitNum);

    res.status(200).json({
      artworks: formattedArtworks,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalArtworks,
      },
    });
  } catch (error) {
    console.error("Error fetching public artworks:", error);
    res.status(500).json({
      message: "Failed to fetch artworks",
      error: error.message,
    });
  }
};
