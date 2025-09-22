const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  searchUsers 
} = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(auth);

// Get all users
router.get('/', getAllUsers);

// Search users
router.get('/search', searchUsers);

// Get user by ID
router.get('/:id', getUserById);

// Create user
router.post(
  '/',
  [
    body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('phone').optional().isLength({ min: 10 }).withMessage('Phone must be at least 10 characters'),
    body('address').optional().isLength({ min: 5 }).withMessage('Address must be at least 5 characters')
  ],
  createUser
);

// Update user
router.put(
  '/:id',
  [
    body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('phone').optional().isLength({ min: 10 }).withMessage('Phone must be at least 10 characters'),
    body('address').optional().isLength({ min: 5 }).withMessage('Address must be at least 5 characters')
  ],
  updateUser
);

// Delete user
router.delete('/:id', deleteUser);

module.exports = router;
