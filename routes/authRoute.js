import express from 'express';
import { register, login, refreshToken, verifyEmail, resendVerificationCode, getUserInfo, getAllUsers } from '../controllers/authController.js';
import authenticate from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification-code', resendVerificationCode);
router.get('/me', authenticate, getUserInfo);
router.get('/users', authenticate, isAdmin, getAllUsers);

export default router;