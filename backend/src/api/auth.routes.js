import express from 'express';
import { register, login } from './auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login); 


// نستخدم "export default" لتصدير الراوتر
export default router;