import express from 'express';
// استيراد الدوال الجديدة
import { createAuction, getAllAuctions, getAuctionById, placeBid, createMoyasarPayment } from './auction.controller.js';
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

router.post('/:id/bids', protect, checkRole(['BUYER']), placeBid);


router.post('/:id/checkout', protect, createMoyasarPayment);

export default router;