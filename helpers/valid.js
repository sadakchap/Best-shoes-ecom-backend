const { check } = require('express-validator');

exports.validSignup = [
    check('email', 'Enter a valid email address').isEmail(),
    check('name', 'Name is required field').not().isEmpty(),
    check('password')
        .isLength({ min: 5 }).withMessage('must be at least 5 chars long')
        .matches(/\d/).withMessage('must contain a number')
];

exports.validSignin = [
    check('email', 'Enter a valid email address').isEmail(),
    check('password')
        .isLength({ min: 5 }).withMessage('must be at least 5 chars long')
        .matches(/\d/).withMessage('must contain a number')
];

exports.validForgotPassword = [
    check('email', 'Enter a valid email address').isEmail()
];

exports.validResetPassword = [
    check('newPassword')
        .isLength({ min: 5 }).withMessage('must be at least 5 chars long')
        .matches(/\d/).withMessage('must contain a number')
];