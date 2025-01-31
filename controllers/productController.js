import { Category, Product } from '../models/index.js'; // Import the Category model
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';


// Get all products
export const getProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Current page (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Number of products per page (default: 10)
    const offset = (page - 1) * limit; // Calculate the offset

    try {
        // Fetch products with pagination
        const { count, rows: products } = await Product.findAndCountAll({
            include: [{ model: Category, attributes: ['name'] }], // Include category details
            limit, // Number of products per page
            offset, // Starting point for the query
        });

        // Map through products and update image URLs
        const productsWithImageUrls = products.map((product) => ({
            ...product.toJSON(),
            images: product.images.map((image) => `http://localhost:5000/uploads/${image}`),
        }));

        // Calculate total pages
        const totalPages = Math.ceil(count / limit);

        // Send the response with pagination metadata
        res.json({
            products: productsWithImageUrls,
            total: count,
            page: page, // Current page
            limit: limit, // Number of products per page
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id, {
            include: [{ model: Category, attributes: ['name'] }],
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update image URLs
        const productWithImageUrls = {
            ...product.toJSON(),
            images: product.images.map((image) => `http://localhost:5000/uploads/${image}`),
        };

        res.json(productWithImageUrls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new product
export const createProduct = async (req, res) => {
    const { name, description, price, images, categoryId, quantity, isStock, discount, discountStartDate, discountEndDate } = req.body;

    try {
        // Check if the category exists
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Create the product
        const product = await Product.create({
            name,
            description,
            price,
            images,
            categoryId, // Associate the product with the category
            quantity,
            isStock,
            discount,
            discountStartDate,
            discountEndDate,
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a product
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, images, categoryId, quantity, isStock, discount, discountStartDate, discountEndDate } = req.body;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the category exists (if categoryId is provided)
        if (categoryId) {
            const category = await Category.findByPk(categoryId);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
        }

        if (images && product.images && product.images.length > 0) {
            const oldImages = product.images; // Old images array
            const newImages = images; // New images array

            // Find images that were removed
            const deletedImages = oldImages.filter((oldImage) => !newImages.includes(oldImage));

            // Delete removed images from the uploads folder
            for (const deletedImage of deletedImages) {
                const deletedImagePath = path.join('uploads', deletedImage); // Construct the full path
                if (fs.existsSync(deletedImagePath)) {
                    fs.unlinkSync(deletedImagePath); // Delete the image file
                }
            }
        }

        // Update the product
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.images = images || product.images;
        product.categoryId = categoryId || product.categoryId;
        product.quantity = quantity || product.quantity;
        product.isStock = isStock || product.isStock;
        product.discount = discount || product.discount;
        product.discountStartDate = discountStartDate || product.discountStartDate;
        product.discountEndDate = discountEndDate || product.discountEndDate;

        await product.save();

        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Upload product image
export const uploadImage = (req, res) => {

    console.log(req.body); // Log the request body
    console.log(req.files); 

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const uploadedFiles = req.files.map((file) => file.filename);

    res.json({
        message: 'Files uploaded successfully.',
        files: uploadedFiles,
    });
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the product by ID
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Delete the associated images from the uploads folder
        if (product.images && product.images.length > 0) {
            for (const image of product.images) {
                const imagePath = path.join('uploads', image); // Construct the full image path
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath); // Delete the image file
                }
            }
        }

        // Delete the product from the database
        await product.destroy();

        res.json({ message: 'Product deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const relatedProducts = async (req, res) => {
    const { productId } = req.params;
    try {
        const product = await Product.findByPk(productId, {
            include: [{ model: Category }]
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const relatedProducts = await Product.findAll({
            where: {
                categoryId: product.categoryId,
                id: { [Op.ne]: productId }
            },
            order: sequelize.random(),
            limit:4
        });

        return res.status(200).json(relatedProducts);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}