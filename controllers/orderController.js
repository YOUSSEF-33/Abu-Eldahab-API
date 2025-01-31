import axios from "axios";
import { Order, OrderItem, Product } from "../models/index.js";
import env from "dotenv";
import PayTabs from "paytabs_pt2";
import { InfobidSendMessage } from "../services/Infobid.js";

env.config();

const PAYTABS_PROFILE_ID = process.env.PAYTABS_PROFILE_ID;
const PAYTABS_SECRET_KEY = process.env.PAYTABS_SECRET_KEY;
const region = "EGY"

export const createOrder = async (req, res) => {
    const { items, totalAmountEGP, totalAmountSAR, currency, paymentMethod, customerDetails } = req.body;
    //const clientIp = requestIp.getClientIp(req) || '10.0.0.1';
    try {
        PayTabs.setConfig(PAYTABS_PROFILE_ID, PAYTABS_SECRET_KEY, region);
        // Validate Payment Method
        const paymentMethods = ["all"]


        // Calculate total amount from items (fallback validation)
        const calculatedTotal = items.reduce((sum, item) => sum + item.quantity * parseFloat(item.price[currency]), 0);
        if ((currency === "EGP" && totalAmountEGP !== calculatedTotal) ||
            (currency === "SAR" && totalAmountSAR !== calculatedTotal)) {
            throw new Error("Total amount mismatch.");
        }

        const order = await Order.create({
            userId: req.user.id, // Assuming user authentication
            totalAmountEGP,
            totalAmountSAR,
            status: "pending",
            paymentMethod,
            currency
        });


        if (paymentMethod === "card") {
            let transaction_details = [
                "sale",
                "ecom"
            ];

            let cartDetails = [
                order.id.toString(),
                currency,
                currency === "SAR" ? totalAmountSAR : totalAmountEGP,
                "description"
            ];

            let costumerDetailsArr = [
                customerDetails.name,
                customerDetails.email,
                customerDetails.phone,
                customerDetails.street1,
                customerDetails.country,
                customerDetails.state,
                customerDetails.zip,
                customerDetails.city,
                '10.0.0.1',
            ]

            let urls = [
                "https://f5e5-156-197-234-216.ngrok-free.app/cart",
                "https://f5e5-156-197-234-216.ngrok-free.app/",
            ]

            let paymentPageCreated = function ($results) {
                console.log($results);
                // Return payment URL for redirection
                res.json({
                    orderId: order.id,
                    redirectUrl: $results.redirect_url,
                });
            }
            PayTabs.createPaymentPage(
                paymentMethods,
                transaction_details,
                cartDetails,
                costumerDetailsArr,
                costumerDetailsArr,
                urls,
                'ar',
                paymentPageCreated,
                true
            );
        }

        const orderItems = items.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price, // Price object with EGP and SAR
        }))

        await OrderItem.bulkCreate(orderItems);

        res.json({
            orderId: order.id,
            redirectUrl: "orders",
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
};


// Get all orders
export const getOrders = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Current page (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Number of orders per page (default: 10)
    const offset = (page - 1) * limit; // Calculate the offset

    try {
        // Fetch the total number of orders
        const totalOrders = await Order.count();

        // Fetch orders with pagination
        const orders = await Order.findAll({
            include: [
                {
                    model: OrderItem,
                    include: [Product], // Include product details in order items
                },
            ],
            limit, // Number of orders per page
            offset, // Starting point for the query
        });

        // Send the response with pagination metadata
        res.json({
            total: totalOrders,
            page: page, // Current page
            limit: limit, // Number of orders per page
            orders, // Orders for the current page
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get User Orders
export const getUserPendingOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: orders } = await Order.findAndCountAll({
            where: {
                userId,
                status: 'pending' // Filter by pending status
            },
            include: [
                {
                    model: OrderItem,
                    include: [Product],
                    attributes: ['id', 'quantity', 'price']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            distinct: true
        });

        const order = {
            success: true,
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
            orders: orders.map(order => ({
                id: order.id,
                totalAmountEGP: order.totalAmountEGP,
                totalAmountSAR: order.totalAmountSAR,
                paymentMethod: order.paymentMethod,
                currency: order.currency,
                createdAt: order.createdAt,
                items: order.OrderItems.map(item => ({
                    product: item.Product,
                    quantity: item.quantity,
                    price: {
                        EGP: item.price.EGP,
                        SAR: item.price.SAR
                    }
                }))
            }))
        };
        
        res.json(order);

    } catch (error) {
        console.error('Get pending orders error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve pending orders'
        });
    }
};

// Get a single order by ID
export const getOrderById = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findByPk(id, {
            include: [
                {
                    model: OrderItem,
                    include: [Product], // Include product details in order items
                },
            ],
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an order
export const updateOrder = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Update the order status
        order.status = status || order.status;
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete an order
export const deleteOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        await Order.destroy({ where: { id } });

        res.status(200).json({ message: 'Order deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};