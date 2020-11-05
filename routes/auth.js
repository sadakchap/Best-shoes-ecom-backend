const express = require('express');
const router = express.Router();
const { signup, signin, signout, emailVerifyController, sendForgotPasswordEmail, resetUserPassword } = require('../controllers/auth');
const { validSignup, validSignin, validForgotPassword, validResetPassword } = require('../helpers/valid');

router.post('/signup', validSignup, signup);
router.post('/signin', validSignin, signin);
router.get('/signout', signout);

router.put('/email/verify', emailVerifyController);
router.put('/user/password/forgot', validForgotPassword, sendForgotPasswordEmail);
router.put('/user/password/reset', validResetPassword, resetUserPassword);


module.exports = router;