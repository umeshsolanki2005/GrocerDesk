const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// ------------------- SIGNUP -------------------
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    // Check if email already exists
    const [rows] = await db.execute('SELECT staff_id FROM staff WHERE email = ?', [email]);
    if (rows.length) {
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

    // Sign JWT
    const token = jwt.sign(
      { staff_id, name, email, role: finalRole },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Staff created',
      token,
      staff: { staff_id, name, email, role: finalRole }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------- LOGIN -------------------
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Select only necessary columns
    const [rows] = await db.execute(
      'SELECT staff_id, name, email, password, role FROM staff WHERE email = ?',
      [email]
    );

    if (!rows.length) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const staff = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Sign JWT
    const token = jwt.sign(
      { staff_id: staff.staff_id, name: staff.name, email: staff.email, role: staff.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      staff: {
        staff_id: staff.staff_id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
