import express from 'express';
import { getMyProfile, getMyArtworks } from './user.controller.js';
import { protect } from '../middleware/auth.middleware.js'; // Import the middleware

const router = express.Router();

// Any request to this route must first pass through the 'protect' middleware
router.get('/profile', protect, getMyProfile);

// Add the new route for fetching a student's own artworks
router.get('/me/artworks', protect, getMyArtworks);

router.get('/me/bids', protect, getMyActiveBids);
router.get('/me/wins', protect, getMyWonArtworks);

export default router;