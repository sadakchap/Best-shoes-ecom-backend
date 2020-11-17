const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const orderItemSchema = new mongoose.Schema({
    product: {
        type: ObjectId,
        ref: "Product",
        required: true
    },
    name: String,
    price: Number,
    quantity: Number
});

const orderSchema = new mongoose.Schema({
    products: [orderItemSchema],
    transaction_id: {},
    amount: Number,
    address: String,
    updated: Date,
    user: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        default: 'Recieved',
        enum: ['Cancelled', 'Delivered', 'Shipped', 'Processing', 'Recieved']
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = {
    Order,
    OrderItem
};