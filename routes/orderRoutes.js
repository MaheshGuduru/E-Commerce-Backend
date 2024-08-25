const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const router = express.Router();

// Place an order
router.post('/', async (req, res) => {
    try {
        const { products } = req.body;
        let totalPrice = 0;

        // Calculate total price and update stock
        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product || product.stockQuantity < item.quantity) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }
            totalPrice += product.price * item.quantity;
            product.stockQuantity -= item.quantity;
            await product.save();
        }

        const order = new Order({
            user: req.user.id,
            products,
            totalPrice
        });

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all orders for a user
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).populate('products.product');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
