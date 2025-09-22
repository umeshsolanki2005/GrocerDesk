const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  searchProducts,
  updateStock,
  getLowStockProducts
} = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(auth);

// Get all products
router.get('/', getAllProducts);

// Search products
router.get('/search', searchProducts);

// Get low stock products
router.get('/low-stock', getLowStockProducts);

// Get product by ID
router.get('/:id', getProductById);

// Create product
router.post(
  '/',
  [
    body('name').isLength({ min: 2 }).withMessage('Product name must be at least 2 characters'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('category_id').optional().isUUID().withMessage('Invalid category ID')
  ],
  createProduct
);

// Update product
router.put(
  '/:id',
  [
    body('name').optional().isLength({ min: 2 }).withMessage('Product name must be at least 2 characters'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('category_id').optional().isUUID().withMessage('Invalid category ID')
  ],
  updateProduct
);

// Update stock
router.put(
  '/:id/stock',
  [
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('operation').isIn(['add', 'subtract', 'set']).withMessage('Operation must be add, subtract, or set')
  ],
  updateStock
);

// Delete product
router.delete('/:id', deleteProduct);

module.exports = router;
