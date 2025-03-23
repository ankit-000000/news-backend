const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

// Public route
router.get('/', categoryController.getCategories);
router.get('/all', categoryController.getAllCategories);


// Admin routes
router.use(auth, checkRole(['ADMIN']));
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router; 