const express = require('express');
const router = express.Router();

const { isSignedIn, isAuthenticated } = require('../controllers/auth');
const { getMeTxnToken, processPayment } = require('../controllers/patymPayment');
const { getUserById } = require('../controllers/user');

router.param("userId", getUserById);

router.get('/payment/gettoken/:userId', isSignedIn, isAuthenticated, getMeTxnToken);
router.post('/payment/callback', processPayment);


module.exports = router;