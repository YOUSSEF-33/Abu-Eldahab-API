import express from 'express';
import authenticate from '../middlewares/auth.js';
import { createOrder, deleteOrder, getOrderById, getOrders, getUserPendingOrders, updateOrder } from '../controllers/orderController.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = express.Router();

router.get('/', authenticate, isAdmin, getOrders);
router.get('/pending-orders', authenticate, getUserPendingOrders);
router.get('/:id', authenticate, isAdmin, getOrderById);
router.post('/', authenticate, createOrder);
router.put('/:id', authenticate, isAdmin, updateOrder);
router.put('/:id', authenticate, isAdmin, deleteOrder);

export default router;