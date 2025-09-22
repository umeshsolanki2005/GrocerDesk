const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  getAllCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  getCategoryStats 
} = require('../controllers/categoryController');
const auth = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(auth);

// Get all categories
router.get('/', getAllCategories);

// Get category statistics
router.get('/stats', getCategoryStats);

// Get category by ID
router.get('/:id', getCategoryById);

// Create category
router.post(
  '/',
  [
    body('name').isLength({ min: 2 }).withMessage('Category name must be at least 2 characters')
  ],
  createCategory
);

// Update category
router.put(
  '/:id',
  [
    body('name').isLength({ min: 2 }).withMessage('Category name must be at least 2 characters')
  ],
  updateCategory
);

// Delete category
router.delete('/:id', deleteCategory);

module.exports = router;
