const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  getAllStaff, 
  getStaffById, 
  createStaff, 
  updateStaff, 
  deleteStaff, 
  changePassword 
} = require('../controllers/staffController');
const auth = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(auth);

// Get all staff
router.get('/', getAllStaff);

// Get staff by ID
router.get('/:id', getStaffById);

// Create staff (admin only)
router.post(
  '/',
  [
    body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'cashier', 'manager']).withMessage('Invalid role')
  ],
  createStaff
);

// Update staff
router.put(
  '/:id',
  [
    body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('role').optional().isIn(['admin', 'cashier', 'manager']).withMessage('Invalid role')
  ],
  updateStaff
);

// Delete staff
router.delete('/:id', deleteStaff);

// Change password
router.put(
  '/:id/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  changePassword
);

module.exports = router;
