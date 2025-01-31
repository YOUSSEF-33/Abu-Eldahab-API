// models/index.js
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import User from './user.js';
import Category from './Category.js';

// Define relationships

Category.hasMany(Product, {foreignKey:'categoryId'});
Product.belongsTo(Category, {foreignKey:'categoryId'});

Order.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId' });

OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });

OrderItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });

// Export models
export { User, Product, Category, Order, OrderItem };