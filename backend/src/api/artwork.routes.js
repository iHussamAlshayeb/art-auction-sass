import express from "express";
import { createArtwork, getAllArtworks } from "./artwork.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js"; // Import both middlewares

const router = express.Router();

// To post a new artwork, a user must be:
// 1. Logged in (checked by 'protect')
// 2. Have the role of 'STUDENT' (checked by 'checkRole')
router.post("/", protect, checkRole(["STUDENT"]), createArtwork);

router.get("/", getAllArtworks);

router.get("/public", getPublicArtworks);

export default router;
