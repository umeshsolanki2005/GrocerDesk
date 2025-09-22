const db = require('../db');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT category_id, name FROM categories ORDER BY name ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Get all categories error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      'SELECT category_id, name FROM categories WHERE category_id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Get category by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;

  try {
    // Check if category name already exists
    const [existingCategory] = await db.execute('SELECT category_id FROM categories WHERE name = ?', [name]);
    if (existingCategory.length) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    // Generate UUID
    const category_id = uuidv4();

    // Insert into DB
    await db.execute(
      'INSERT INTO categories (category_id, name) VALUES (?, ?)',
      [category_id, name]
    );

    res.status(201).json({
      message: 'Category created successfully',
      category: { category_id, name }
    });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name } = req.body;

  try {
    // Check if category exists
    const [existingCategory] = await db.execute('SELECT category_id FROM categories WHERE category_id = ?', [id]);
    if (existingCategory.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if new name already exists
    const [nameCheck] = await db.execute(
      'SELECT category_id FROM categories WHERE name = ? AND category_id != ?',
      [name, id]
    );
    if (nameCheck.length) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    // Update category
    await db.execute('UPDATE categories SET name = ? WHERE category_id = ?', [name, id]);

    res.json({ message: 'Category updated successfully' });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [existingCategory] = await db.execute('SELECT category_id FROM categories WHERE category_id = ?', [id]);
    if (existingCategory.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has products
    const [products] = await db.execute('SELECT product_id FROM products WHERE category_id = ?', [id]);
    if (products.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with existing products. Please move or delete products first.' 
      });
    }

    // Delete category
    await db.execute('DELETE FROM categories WHERE category_id = ?', [id]);

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category statistics
exports.getCategoryStats = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        c.category_id,
        c.name,
        COUNT(p.product_id) as product_count,
        COALESCE(SUM(p.stock), 0) as total_stock,
        COALESCE(AVG(p.price), 0) as avg_price
      FROM categories c
      LEFT JOIN products p ON c.category_id = p.category_id
      GROUP BY c.category_id, c.name
      ORDER BY product_count DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Get category stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
