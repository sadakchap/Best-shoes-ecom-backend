const express = require('express');
const { isSignedIn, isAuthenticated, isAdmin } = require('../controllers/auth');
const { getOrderById, createOrder, getAllOrders, getOrderStatus, updateOrderStatus } = require('../controllers/order');
const { getUserById } = require('../controllers/user');
const router = express.Router();

router.param("userId", getUserById);
router.param("orderId", getOrderById);

router.post('/order/:userId', isSignedIn, isAuthenticated, createOrder);

router.get('/order/all/:userId', isSignedIn, isAuthenticated, isAdmin, getAllOrders);

router.get('/order/status/:userId', isSignedIn, isAuthenticated, isAdmin, getOrderStatus);
router.put('/order/:orderId/status/:userId', isSignedIn, isAuthenticated, isAdmin, updateOrderStatus);


module.exports = router;