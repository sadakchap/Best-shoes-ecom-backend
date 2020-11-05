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
    
};