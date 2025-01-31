import express from 'express';
import authenticate from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { getDashboard } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/', authenticate, isAdmin, getDashboard);

export default router;