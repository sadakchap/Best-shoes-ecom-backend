const express = require('express');
const { isSignedIn } = require('../controllers/auth');
const { getOrderById } = require('../controllers/order');
const { getUserById } = require('../controllers/user');
const router = express.Router();

router.param("userId", getUserById);
router.param("orderId", getOrderById);

router.post('/order/:userId', isSignedIn, isAuthenticated, createOrder);

router.get('/order/all/:userId', isSignedIn, isAuthenticated, isAdmin, getAllOrders);

router.get('/order/status/:userId', isSignedIn, isAuthenticated, isAdmin, getOrderStatus);
router.put('/order/:orderId/status/:userId', isSignedIn, isAuthenticated, isAdmin, updateOrderStatus);


module.exports = router;