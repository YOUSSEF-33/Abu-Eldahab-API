import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const Order = db.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    totalAmountEGP: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    totalAmountSAR: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    totalAmountUSD: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true, // Optional if payment isn't made in USD
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        defaultValue: 'pending',
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    paymentReference: {
        type: DataTypes.STRING,
        allowNull: true, // To store PayTabs payment reference
    },
    currency: {
        type: DataTypes.ENUM('EGP', 'SAR', 'USD'),
        allowNull: false,
    },
});

export default Order;
