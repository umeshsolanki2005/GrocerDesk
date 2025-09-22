const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  getAllSales, 
  getSaleById, 
  createSale, 
  deleteSale, 
  getSalesAnalytics,
  getRecentSales
} = require('../controllers/saleController');
const auth = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(auth);

// Get all sales
router.get('/', getAllSales);

// Get sales analytics
router.get('/analytics', getSalesAnalytics);

// Get recent sales
router.get('/recent', getRecentSales);

// Get sale by ID
router.get('/:id', getSaleById);

// Create sale
router.post(
  '/',
  [
    body('user_id').optional().isUUID().withMessage('Invalid user ID'),
    body('items').isArray({ min: 1 }).withMessage('Items array is required'),
    body('items.*.product_id').isUUID().withMessage('Invalid product ID'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
  ],
  createSale
);

// Delete sale (refund)
router.delete('/:id', deleteSale);

module.exports = router;
