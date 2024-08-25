const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

const data = require('./ecommerceData.json');

mongoose.connect('mongodb://localhost:27017/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
    return seedDatabase();
})
.catch(err => console.error('Failed to connect to MongoDB', err));

async function seedDatabase() {
    try {
        // Clear existing data
        await Product.deleteMany({});
        await User.deleteMany({});
        await Order.deleteMany({});

        // Insert products
        const products = await Product.insertMany(data.products);
        console.log('Inserted products:', products);

        // Insert users
        const users = await User.insertMany(data.users);
        console.log('Inserted users:', users);

        // Insert orders
        const orders = data.orders.map(order => {
            order.user = users[Math.floor(Math.random() * users.length)]._id;
            order.products = order.products.map(p => ({
                product: products[Math.floor(Math.random() * products.length)]._id,
                quantity: p.quantity
            }));
            return order;
        });
        await Order.insertMany(orders);
        console.log('Inserted orders:', orders);

        mongoose.connection.close();
    } catch (err) {
        console.error('Failed to seed database:', err);
        mongoose.connection.close();
    }
}
