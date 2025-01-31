import express from 'express';
import { getProducts, createProduct, uploadImage, updateProduct, getProductById, deleteProduct, relatedProducts  } from '../controllers/productController.js';
import upload from '../utils/upload.js';
import  authenticate from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = express.Router();

router.get('/', getProducts); 
router.get('/:id', getProductById);
router.post('/', authenticate, isAdmin, createProduct);
router.put('/:id', authenticate, isAdmin, updateProduct);
router.delete('/:id', authenticate, isAdmin, deleteProduct);
router.get('/related/:productId', authenticate, relatedProducts);
router.post('/upload', authenticate, isAdmin, upload.array('images', 10), uploadImage);

export default router;