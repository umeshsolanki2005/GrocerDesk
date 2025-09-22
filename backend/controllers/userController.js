const db = require('../db');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT user_id, name, email, phone, address FROM users ORDER BY name ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      'SELECT user_id, name, email, phone, address FROM users WHERE user_id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create user
exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, address } = req.body;

  try {
    // Check if email already exists (if provided)
    if (email) {
      const [existingUser] = await db.execute('SELECT user_id FROM users WHERE email = ?', [email]);
      if (existingUser.length) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Generate UUID
    const user_id = uuidv4();

    // Insert into DB
    await db.execute(
      'INSERT INTO users (user_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [user_id, name, email, phone, address]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: { user_id, name, email, phone, address }
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, email, phone, address } = req.body;

  try {
    // Check if user exists
    const [existingUser] = await db.execute('SELECT user_id FROM users WHERE user_id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already in use by another user (if provided)
    if (email) {
      const [emailCheck] = await db.execute(
        'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
        [email, id]
      );
      if (emailCheck.length) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update user (convert undefined to null)
    await db.execute(
      'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE user_id = ?',
      [name ?? null, email ?? null, phone ?? null, address ?? null, id]
    );

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [existingUser] = await db.execute('SELECT user_id FROM users WHERE user_id = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    await db.execute('DELETE FROM users WHERE user_id = ?', [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const [rows] = await db.execute(
      `SELECT user_id, name, email, phone, address 
       FROM users 
       WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? 
       ORDER BY name ASC`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );

    res.json(rows);
  } catch (err) {
    console.error('Search users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
