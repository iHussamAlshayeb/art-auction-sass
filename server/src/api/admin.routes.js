import express from 'express';
import { getStats, getAllUsers } from './admin.controller.js';
import { protect, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// حماية كل المسارات في هذا الملف: يجب أن يكون المستخدم مسجلاً دخوله وأن يكون دوره 'ADMIN'
router.use(protect, checkRole(['ADMIN']));

// تعريف المسارات
router.get('/stats', getStats);
router.get('/users', getAllUsers);


router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);


export default router;