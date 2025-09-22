const db = require('../db');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// Get all staff
exports.getAllStaff = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT staff_id, name, email, role FROM staff ORDER BY name ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Get all staff error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get staff by ID
exports.getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      'SELECT staff_id, name, email, role FROM staff WHERE staff_id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Get staff by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create staff
exports.createStaff = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    // Check if email already exists
    const [existingStaff] = await db.execute('SELECT staff_id FROM staff WHERE email = ?', [email]);
    if (existingStaff.length) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate UUID
    const staff_id = uuidv4();
    const finalRole = role || 'cashier';

    // Insert into DB
    await db.execute(
      'INSERT INTO staff (staff_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [staff_id, name, email, hashedPassword, finalRole]
    );

    res.status(201).json({
      message: 'Staff created successfully',
      staff: { staff_id, name, email, role: finalRole }
    });
  } catch (err) {
    console.error('Create staff error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update staff
exports.updateStaff = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, email, role } = req.body;

  try {
    // Check if staff exists
    const [existingStaff] = await db.execute('SELECT staff_id FROM staff WHERE staff_id = ?', [id]);
    if (existingStaff.length === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Check if email is already in use by another staff
    if (email) {
      const [emailCheck] = await db.execute(
        'SELECT staff_id FROM staff WHERE email = ? AND staff_id != ?',
        [email, id]
      );
      if (emailCheck.length) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update staff
    await db.execute(
      'UPDATE staff SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role) WHERE staff_id = ?',
      [name, email, role, id]
    );

    res.json({ message: 'Staff updated successfully' });
  } catch (err) {
    console.error('Update staff error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete staff
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if staff exists
    const [existingStaff] = await db.execute('SELECT staff_id FROM staff WHERE staff_id = ?', [id]);
    if (existingStaff.length === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Delete staff
    await db.execute('DELETE FROM staff WHERE staff_id = ?', [id]);

    res.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    console.error('Delete staff error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    // Get current password
    const [rows] = await db.execute('SELECT password FROM staff WHERE staff_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.execute('UPDATE staff SET password = ? WHERE staff_id = ?', [hashedPassword, id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
