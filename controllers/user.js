const { Order } = require('../models/order');
const User = require('../models/user');

exports.getUserById = (req, res, next, id) => {
    User.findById(id).select('-hashed_password -salt').exec((err, user) => {
        if(err || !user){
            return res.status(400).json({
                error: 'User not found!'
            })
        }
        req.profile = user;
        next();
    });
};

exports.getUser = (req, res) => {
    console.log(req.profile);
    return res.status(200).json(req.profile);
};

exports.updateUser = (req, res) => {
    User.findByIdAndUpdate(
        {_id: req.profile._id},
        {$set: req.body},
        {new: true, useFindAndModify: false},
        (err, user) => {
            if(err || !user){
                return res.status(400).json({
                    error: "Could not update the user"
                });
            }
            user.salt = undefined;
            user.hashed_password = undefined;
            return res.status(201).json(user);
        }
    )
};

exports.userPurchaseList = (req, res) => {
    Order.find({ user: req.profile._id })
        .populate('user', '_id name')
        .exec((err, orders) => {
            if(err || !orders){
                return res.status(400).json({
                    error: 'No order in this account'
                });
            }
            return res.json(orders);
        })
};

// middleware
exports.pushOrderInPurchaseList = (req, res, next) => {
    let purchases = [];
    req.body.order.products.forEach(prod => {
        purchases.push({
            _id: prod._id,
            name: prod.name,
            desc: prod.desc,
            category: prod.category,
            quantity: prod.quantity,
            amount: req.body.order.amount,
            transaction_id: req.body.order.transaction_id
        });
    });
    User.findOneAndUpdate(
        {_id: req.profile._id},
        {$push: {purchases}},
        {new: true},
        (err, updatedUser) => {
            if(err){
                return res.status(400).json({
                    error: 'Unable to save purchase list'
                })
            }
            next();
        }
    );
};