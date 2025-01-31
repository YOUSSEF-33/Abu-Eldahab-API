import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import logger from './middlewares/logger.js';
import errorHandler from './middlewares/errorHandler.js';
import authRoute from './routes/authRoute.js';
import products from './routes/products.js';
import path from 'path';
import categoryRoutes from './routes/categoryRoute.js';
import orderRoute from './routes/orderRoute.js';
import dashboardRoute from './routes/dashboardRoute.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Serve static files from the 'uploads' folder
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/v1/api', routes);
app.use('/v1/api/auth', authRoute);
app.use('/v1/api/products', products);
app.use('/v1/api/categories', categoryRoutes);
app.use('/v1/api/orders', orderRoute);
app.use('/v1/api/dashboard', dashboardRoute);


//Error Handler
app.use(errorHandler)

export default app;