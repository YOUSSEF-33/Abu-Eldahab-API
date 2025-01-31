import { Order, OrderItem, Product } from "../models/index.js"


export const getDashboard = async (req, res)=>{
    try {
        const totalRevenueInEGP = await Order.sum("totalAmountEGP");
        const totalRevenueInSAR = await Order.sum("totalAmountSAR");

        const totalOrders = await Order.count();

        const recentOrders = await Order.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5,
            include:[{
                model: OrderItem,
                include: [
                  {
                    model: Product,
                    attributes: ['name'], // Include only the product name
                  },
                ],
              },]
        })

        res.json({ totalRevenueInEGP, totalRevenueInSAR, totalOrders, recentOrders });
    } catch (error) {
        console.log(error)
    }
}