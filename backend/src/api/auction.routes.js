import express from 'express';
// استيراد الدوال الجديدة
import { createAuction, getAllAuctions, getAuctionById, placeBid, createMoyasarPayment, getAuctionBids, cancelAuction } from './auction.controller.js';
import { protect, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// المسار لإنشاء مزاد (موجود مسبقًا)
router.post('/', protect, checkRole(['STUDENT']), createAuction);

// المسار لجلب قائمة بكل المزادات
router.get('/', getAllAuctions);

// المسار لجلب تفاصيل مزاد معين
router.get('/:id', getAuctionById);


router.post('/', protect, checkRole(['STUDENT']), createAuction);
router.get('/', getAllAuctions);
router.get('/:id', getAuctionById);

router.get('/:id/bids', getAuctionBids);

router.post('/:id/bids', protect, checkRole(['BUYER']), placeBid);


router.post('/:id/checkout', protect, createMoyasarPayment);

router.delete('/:id', protect, checkRole(['STUDENT']), cancelAuction);

export default router;