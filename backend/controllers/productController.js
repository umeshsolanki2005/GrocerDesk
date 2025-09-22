const db = require('../db');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// Get all products with category info
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        p.product_id, 
        p.name, 
        p.price, 
        p.stock, 
        p.category_id,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Get all products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(`
      SELECT 
        p.product_id, 
        p.name, 
        p.price, 
        p.stock, 
        p.category_id,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.product_id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Get product by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, price, stock, category_id } = req.body;

  try {
    // Check if category exists (if provided)
    if (category_id) {
      const [category] = await db.execute('SELECT category_id FROM categories WHERE category_id = ?', [category_id]);
      if (category.length === 0) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    // Generate UUID
    const product_id = uuidv4();

    // Insert into DB
    await db.execute(
      'INSERT INTO products (product_id, name, price, stock, category_id) VALUES (?, ?, ?, ?, ?)',
      [product_id, name, price, stock || 0, category_id]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: { product_id, name, price, stock: stock || 0, category_id }
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, price, stock, category_id } = req.body;

  try {
    // Check if product exists
    const [existingProduct] = await db.execute('SELECT product_id FROM products WHERE product_id = ?', [id]);
    if (existingProduct.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if category exists (if provided)
    if (category_id) {
      const [category] = await db.execute('SELECT category_id FROM categories WHERE category_id = ?', [category_id]);
      if (category.length === 0) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    // Update product
    await db.execute(
      'UPDATE products SET name = COALESCE(?, name), price = COALESCE(?, price), stock = COALESCE(?, stock), category_id = COALESCE(?, category_id) WHERE product_id = ?',
      [name, price, stock, category_id, id]
    );

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const [existingProduct] = await db.execute('SELECT product_id FROM products WHERE product_id = ?', [id]);
    if (existingProduct.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product has been sold (has sale items)
    const [saleItems] = await db.execute('SELECT sale_item_id FROM sale_items WHERE product_id = ?', [id]);
    if (saleItems.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete product with sales history. Consider marking as discontinued instead.' 
      });
    }

    // Delete product
    await db.execute('DELETE FROM products WHERE product_id = ?', [id]);

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { q, category_id } = req.query;
    
    let query = `
      SELECT 
        p.product_id, 
        p.name, 
        p.price, 
        p.stock, 
        p.category_id,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE 1=1
    `;
    const params = [];

    if (q) {
      query += ' AND (p.name LIKE ? OR c.name LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }

    if (category_id) {
      query += ' AND p.category_id = ?';
      params.push(category_id);
    }

    query += ' ORDER BY p.name ASC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Search products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update stock
exports.updateStock = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { stock, operation } = req.body; // operation: 'add', 'subtract', 'set'

  try {
    // Get current stock
    const [rows] = await db.execute('SELECT stock FROM products WHERE product_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const currentStock = rows[0].stock;
    let newStock;

    switch (operation) {
      case 'add':
        newStock = currentStock + stock;
        break;
      case 'subtract':
        newStock = Math.max(0, currentStock - stock);
        break;
      case 'set':
        newStock = stock;
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation. Use: add, subtract, or set' });
    }

    // Update stock
    await db.execute('UPDATE products SET stock = ? WHERE product_id = ?', [newStock, id]);

    res.json({ 
      message: 'Stock updated successfully',
      old_stock: currentStock,
      new_stock: newStock
    });
  } catch (err) {
    console.error('Update stock error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    
    const [rows] = await db.execute(`
      SELECT 
        p.product_id, 
        p.name, 
        p.price, 
        p.stock, 
        p.category_id,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.stock <= ?
      ORDER BY p.stock ASC
    `, [threshold]);
    
    res.json(rows);
  } catch (err) {
    console.error('Get low stock products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
