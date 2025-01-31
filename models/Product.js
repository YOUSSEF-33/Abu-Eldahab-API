import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Product = sequelize.define(
  'Products',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: { EGP: "0", SAR: "0" },
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories', // References the Category table
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Default quantity is 0
    },
    isStock: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Default is false (out of stock)
    },
    discount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0, // Default discount is 0 (no discount)
    },
    discountStartDate: {
      type: DataTypes.DATE,
      allowNull: true, // Allow null if no discount is set
    },
    discountEndDate: {
      type: DataTypes.DATE,
      allowNull: true, // Allow null if no discount is set
    },
  },
  {
    timestamps: true, // Optional: Add timestamps (createdAt, updatedAt)
  }
);

export default Product;