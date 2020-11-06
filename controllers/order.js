const { Order} = require('../models/order');

exports.getOrderById = (req, res, next, id) => {
    Order.findById(id)
        .populate('products.product', '_id name price')
        .exec((err, order) => {
            if(err){
                return res.status(400).json({
                    error: 'Sorry, something went wrong!'
                });
            }
            req.order = order;
            next();
        });
};

exports.createOrder = (req, res) => {
    req.body.order.user = req.profile;
    const order = new Order(req.body.order);
    order.save((err, saved) => {
        if(err || !saved){
            return res.status(400).json({
                error: 'sorry, somthing went wrong!'
            });
        }
        return res.json(saved);
    });
};

exports.getAllOrders = (req, res) => {
    Order.find().populate("user", "_id name").exec((err, orders) => {
        if(err || !orders){
            return res.status(400).json({
                error: 'No orders found!'
            });
        }

        return res.status(200).json(orders);
    });
};

exports.getOrderStatus = (req, res) => {
    return res.json(Order.schema.path('status').enumValues);
};

exports.updateOrderStatus = (req, res) => {
    Order.update(
        {_id: req.order._id},
        {$set: {status: req.body.status}},
        (err, order) => {
            if(err){
                return res.status(400).json({error: 'sorry, something went wrong!'});
            }
            return res.json(order);
        }
    )
};