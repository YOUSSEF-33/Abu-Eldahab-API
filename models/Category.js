import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";


const Category = sequelize.define(
    'categories',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
);

export default Category;