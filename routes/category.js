const express = require('express');
const { isSignedIn, isAuthenticated, isAdmin } = require('../controllers/auth');
const { getUserById } = require('../controllers/user');
const router = express.Router();

const { getCategoryById, createCategory, updateCategory, removeCategory, getCategory, getAllCategories } = require('../controllers/category');

router.param("userId", getUserById);
router.param("categoryId", getCategoryById);

router.get('/category/:categoryId', getCategory);
router.get('/categories', getAllCategories);

router.post('/category/create/:userId', isSignedIn, isAuthenticated, isAdmin, createCategory);

router.put('/category/:userId/:categoryId', isSignedIn, isAuthenticated, isAdmin, updateCategory);
router.delete('/category/:userId/:categoryId', isSignedIn, isAuthenticated, isAdmin, removeCategory);


module.exports = router;