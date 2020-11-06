const express = require('express');
const { isSignedIn, isAdmin, isAuthenticated } = require('../controllers/auth');
const { getProductById, getProduct, getAllProducts, photo } = require('../controllers/product');
const { getUserById } = require('../controllers/user');
const router = express.Router();

router.param("userId", getUserById);
router.param("productId", getProductById);

rotuer.get('product/photo/:productId', photo);

router.get('/product/:productId', getProduct);
router.get('/products', getAllProducts);
router.get('/products/categories', getAllUniqueCategory);

router.post('/product/create/:userId', isSignedIn, isAuthenticated, isAdmin, createProduct);
router.put('/product/:productId/:userId', isSignedIn, isAuthenticated, isAdmin, updateProduct);
router.delete('/product/:productId/:userId', isSignedIn, isAuthenticated, isAdmin, removeProduct);

module.exports = router;