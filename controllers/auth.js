const User = require('../models/user');
const { validationResult } = require("express-validator");
const sendEmail = require('../helpers/sendEmail');
const jwt = require('jsonwebtoken');
const expressJwt =  require('express-jwt');

exports.signup = (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            error: errors.array()[0]["msg"]
        });
    }
    const { email, name, password } = req.body;
    // check for existing user
    User.findOne({ email }).exec((err, user) => {
        if(user){
            return res.status(400).json({
                error: 'Sorry, email already taken!'
            });
        }else{
            const newUser = new User({ email, name, password });
            newUser.save((err, saved) => {
                if(err){
                    return res.status(400).json({
                        error: 'Sorry, something went wrong!'
                    });
                }
                const verifyToken = jwt.sign({ user: saved.email }, process.env.JWT_VERIFY_EMAIL_SECRET, { expiresIn: '1d' });
                const verifyLink = `${process.env.CLIENT_URL}/user/verify/${verifyToken}`;
                const html = `
                    <p>Hi, ${saved.name}</p>
                    <p>Thank you for choosing Us. We will try our best to help you find best Watch!</p>
                    <p>You are only 1 step closer to finding your dream watch, Please click on the link below to confirm your email!</p>
                    <a href="${verifyLink}" target="_blank">Verify Email</a>
                `;
                sendEmail(saved.email, 'Watches-ECOM Email Verification Link', html)
                    .then(result => {
                        console.log(result); //{ message: 'success' }
                        return res.status(201).json({
                            message: 'Please, verify your email address!'
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        return res.status(500).json({
                            error: 'Could\'t send Email!'
                        });
                    })
            });
        }
    })
};

exports.signin = (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            error: errors.array()[0]["msg"]
        });
    }
    const { email, password } =  req.body;

    User.findOne({ email }).exec((err, user) => {
        if(err){
            return res.status(400).json({
                error: 'Sorry, something went wrong!'
            });
        }
        if(!user){
            return res.status(400).json({
                error: 'Email not registered yet!'
            });
        }
        if(!user.authenticate(password)){
            return res.status(400).json({
                error: 'Email & password do not match!'
            });
        }
        const token = jwt.sign({ user: user._id }, process.env.JWT_AUTH_SECRET, { expiresIn: '7d' });
        const { _id, name, email, role, is_verified } = user;
        res.cookie('token', token, {
            // httpOnly: true,
            expire: new Date() + 9999
        });
        
        return res.status(200).json({
            token,
            user: { _id, name, email, role },
            message: is_verified ? null : 'Please verify your email address!'
        });
    })
};

exports.signout = (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({
        message: 'User SignOut!'
    });
};

exports.emailVerifyController = (req, res) => {
    const { token } = req.body;
    if(!token){
        return res.status(400).json({
            error: 'Missing verify token, kindly generate link again!'
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_VERIFY_EMAIL_SECRET);
        User.findOne({ email: decoded.user }).exec((err, user) => {
            if(err || !user){
                return res.status(400).json({
                    error: 'Sorry, something went wrong!'
                });
            }
            user.is_verified = true;
            user.save((err, saved) => {
                if(err){
                    return res.status(400).json({
                        error: 'Error in updating user info'
                    });
                }
                return res.status(200).json({
                    message: 'Email verified Successfully!'
                });
            })
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            error: 'Invalid or Expired token!'
        })
    }
};

exports.sendForgotPasswordEmail = (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            error: errors.array()[0]["msg"]
        });
    }
    const { email } = req.body;
    User.findOne({ email }).exec((err, user) => {
        if(err || !user){
            return res.status(400).json({
                error: 'Sorry, something went wrong!'
            })
        }
        const forgotToken = jwt.sign({ user: user._id }, process.env.JWT_RESET_PASSWORD_SECRET, { expiresIn: '20m' });
        user.resetPasswordLink = forgotToken;
        user.save((err, saved) => {
            if(err){
                return res.status(400).json({
                    error: 'Sorry, something went wrong!'
                });
            }
            const forgotPasswordLink = `${process.env.CLIENT_URL}/user/password/forgot/${forgotToken}`;
            const html = `
                <p>Looks like you forgot your password </p>
                <p>Please click on the link below to reset your password </p>
                <a href="${forgotPasswordLink}" target="_blank">Reset Password</a>
                </br>
                <p>If you didn't generated this link, no need to take any action!</p>
                <p>.</p>
                <p>.</p>
                <p> Happy Shopping!, Watches - ECOM </p>

            `;
            sendEmail(user.email, 'Watches ECOM - Password Reset Link', html)
                .then(result => {
                    console.log(result);
                    if(result.message === 'success'){
                        return res.status(200).json({
                            message: 'Reset Password link is sent, Please check your inbox!'
                        });
                    }
                    return res.status(200).json({
                        error: 'Something went wrong, CORRECTLY!'
                    })
                })
                .catch(err => {
                    console.log(err);
                    return res.status(400).json({
                        error: 'Could\'t send mail!'
                    });
                })
        })
    })
};

exports.resetUserPassword = (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            error: errors.array()[0]["msg"]
        });
    }
    const { newPassword, token } = req.body;
    if(!token){
        return res.status(400).json({
            error: 'Missing token!'
        });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_RESET_PASSWORD_SECRET);
        User.findById(decodedToken.user).exec((err, user) => {
            if(err || !user){
                return res.status(400).json({
                    error: 'Sorry, something went wrong!'
                });
            }
            if(user.resetPasswordLink !== token){
                return res.status(400).json({
                    error: 'Sorry, this is one time password reset link!'
                });
            }
            user.password = newPassword;
            user.resetPasswordLink = '';
            user.save((err, saved) => {
                if(err){
                    return res.status(400).json({
                        error: 'Sorry, something went wrong!'
                    });
                }
                return res.status(200).json({
                    message: 'Password reset successfully!'
                });
            });
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            error: 'Invalid or Expired token!'
        });
    }
};

// MIDDLEWARES
exports.isSignedIn = expressJwt({ secret: process.env.JWT_AUTH_SECRET, algorithms: ['HS256'], userProperty: 'auth' });

exports.isAuthenticated = (req, res, next) => {
    if(req.auth && req.profile && req.auth.user == req.profile._id){
        next();
    }else{
        return res.status(400).json({
            error: 'Access Denied!'
        });
    }
};

exports.isAdmin = (req, res, next) => {
    if(req.profile.role === 0){
        return res.status(400).json({
            error: 'Access Denied! You are not an Admin!'
        });
    }
    next();
}