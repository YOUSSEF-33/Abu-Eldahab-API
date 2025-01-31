import dotenv from 'dotenv';
import app from './app.js';
import sequelize from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  console.log('Database connected.');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});