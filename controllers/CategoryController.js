import {Category} from '../models/index.js';

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single category by ID
export const getCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findByPk(id, {
            include: 'Products', // Include associated products (if you want to fetch products in the same query)
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new category
export const createCategory = async (req, res) => {
    const { name } = req.body;

    try {
        const category = await Category.create({ name });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a category
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.name = name;
        await category.save();

        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a category
export const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await category.destroy();
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};