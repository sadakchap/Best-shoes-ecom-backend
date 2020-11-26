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
    const cartItems = req.body.order.products;
    const items = [];
    for (let idx = 0; idx < cartItems.length; idx++) {
        const element = cartItems[idx];
        items.push({
            product: element._id,
            name: element.name,
            price: element.price,
            quantity: element.count
        });
    }
    req.body.order.products = items;
    // check for existing transaction id
    Order.findOne({ transaction_id: req.body.order.transaction_id }).exec((err, order) => {
        if(err){
            return res.status(400).json({
                error: 'sorry, somthing went wrong!'
            });
        }
        if(order){
            return res.status(200).json({
                message: 'We have already processed this Order!'
            });
        }
        
        order = new Order(req.body.order);
        order.save((err, saved) => {
            if(err || !saved){
                return res.status(400).json({
                    error: 'sorry, somthing went wrong!'
                });
            }
            return res.json(saved);
        });
    })
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

exports.getOrdersGroupedData = (req, res) => {
    Order.aggregate([ 
        { "$unwind": { "path": "$products", "preserveNullAndEmptyArrays": true } },
        { $group: { 
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt"}} , 
            sold: { 
                $sum: "$products.quantity"
            },
            totalAmount: {
                $sum: '$amount'
            }
        } },
        { $limit: 7 },
    ]).exec((err, data) => {
        if(err){
            console.log(err);
            return res.status(500).json({
                error: 'gol mal h sb gol mal h'
            })
        }
        return res.status(200).json(data);
    });
};