import express from 'express';
import cors from 'cors';
import authRoutes from './api/auth.routes.js';
import userRoutes from './api/user.routes.js';
import artworkRoutes from './api/artwork.routes.js';
import auctionRoutes from './api/auction.routes.js';


const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/artworks', artworkRoutes);
app.use('/api/v1/auctions', auctionRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Art Auction API! 🚀' });
});

export default app;