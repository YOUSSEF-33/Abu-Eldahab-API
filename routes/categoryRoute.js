import express from 'express';
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/CategoryController.js';
import authenticate from '../middlewares/auth.js';

const router = express.Router();

// GET /categories - Get all categories
router.get('/',authenticate, getCategories);

// GET /categories/:id - Get a single category by ID
router.get('/:id',authenticate, getCategoryById);

// POST /categories - Create a new category
router.post('/',authenticate, createCategory);

// PUT /categories/:id - Update a category
router.put('/:id',authenticate, updateCategory);

// DELETE /categories/:id - Delete a category
router.delete('/:id',authenticate, deleteCategory);

export default router;