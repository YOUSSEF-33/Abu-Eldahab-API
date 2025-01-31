// models/OrderItem.js
import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const OrderItem = db.define('OrderItems', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: { EGP: "0", SAR: "0" },
    },
});

export default OrderItem;