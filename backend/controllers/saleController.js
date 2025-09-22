const db = require('../db');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// Get all sales with user info
exports.getAllSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        s.sale_id,
        s.user_id,
        u.name as customer_name,
        u.email as customer_email,
        s.sale_date,
        s.total,
        COUNT(si.sale_item_id) as item_count
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.user_id
      LEFT JOIN sale_items si ON s.sale_id = si.sale_id
    `;
    const params = [];

    if (start_date && end_date) {
      query += ' WHERE s.sale_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    query += ' GROUP BY s.sale_id, s.user_id, u.name, u.email, s.sale_date, s.total ORDER BY s.sale_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.execute(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM sales s';
    const countParams = [];
    if (start_date && end_date) {
      countQuery += ' WHERE s.sale_date BETWEEN ? AND ?';
      countParams.push(start_date, end_date);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      sales: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Get all sales error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get sale by ID with items
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get sale info
    const [saleRows] = await db.execute(`
      SELECT 
        s.sale_id,
        s.user_id,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        s.sale_date,
        s.total
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.user_id
      WHERE s.sale_id = ?
    `, [id]);

    if (saleRows.length === 0) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Get sale items
    const [itemRows] = await db.execute(`
      SELECT 
        si.sale_item_id,
        si.product_id,
        p.name as product_name,
        si.quantity,
        si.price,
        si.subtotal
      FROM sale_items si
      JOIN products p ON si.product_id = p.product_id
      WHERE si.sale_id = ?
    `, [id]);

    res.json({
      sale: saleRows[0],
      items: itemRows
    });
  } catch (err) {
    console.error('Get sale by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new sale
exports.createSale = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { user_id, items } = req.body;

  try {
    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    // Check if user exists (if provided)
    if (user_id) {
      const [user] = await db.execute('SELECT user_id FROM users WHERE user_id = ?', [user_id]);
      if (user.length === 0) {
        return res.status(400).json({ message: 'User not found' });
      }
    }

    // Start transaction
    await db.execute('START TRANSACTION');

    try {
      // Generate sale ID
      const sale_id = uuidv4();
      let total = 0;

      // Validate products and calculate total
      for (const item of items) {
        const [product] = await db.execute(
          'SELECT product_id, name, price, stock FROM products WHERE product_id = ?',
          [item.product_id]
        );

        if (product.length === 0) {
          throw new Error(`Product ${item.product_id} not found`);
        }

        if (product[0].stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product[0].name}. Available: ${product[0].stock}`);
        }

        const subtotal = product[0].price * item.quantity;
        total += subtotal;
      }

      // Create sale record
      await db.execute(
        'INSERT INTO sales (sale_id, user_id, total) VALUES (?, ?, ?)',
        [sale_id, user_id, total]
      );

      // Create sale items and update stock
      for (const item of items) {
        const [product] = await db.execute(
          'SELECT price FROM products WHERE product_id = ?',
          [item.product_id]
        );

        const subtotal = product[0].price * item.quantity;
        const sale_item_id = uuidv4();

        // Insert sale item
        await db.execute(
          'INSERT INTO sale_items (sale_item_id, sale_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
          [sale_item_id, sale_id, item.product_id, item.quantity, product[0].price, subtotal]
        );

        // Update product stock
        await db.execute(
          'UPDATE products SET stock = stock - ? WHERE product_id = ?',
          [item.quantity, item.product_id]
        );
      }

      // Commit transaction
      await db.execute('COMMIT');

      res.status(201).json({
        message: 'Sale created successfully',
        sale_id,
        total
      });
    } catch (error) {
      // Rollback transaction
      await db.execute('ROLLBACK');
      throw error;
    }
  } catch (err) {
    console.error('Create sale error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Delete sale (refund)
exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if sale exists
    const [sale] = await db.execute('SELECT sale_id FROM sales WHERE sale_id = ?', [id]);
    if (sale.length === 0) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Start transaction
    await db.execute('START TRANSACTION');

    try {
      // Get sale items to restore stock
      const [items] = await db.execute(
        'SELECT product_id, quantity FROM sale_items WHERE sale_id = ?',
        [id]
      );

      // Restore stock for each item
      for (const item of items) {
        await db.execute(
          'UPDATE products SET stock = stock + ? WHERE product_id = ?',
          [item.quantity, item.product_id]
        );
      }

      // Delete sale items
      await db.execute('DELETE FROM sale_items WHERE sale_id = ?', [id]);

      // Delete sale
      await db.execute('DELETE FROM sales WHERE sale_id = ?', [id]);

      // Commit transaction
      await db.execute('COMMIT');

      res.json({ message: 'Sale refunded successfully' });
    } catch (error) {
      // Rollback transaction
      await db.execute('ROLLBACK');
      throw error;
    }
  } catch (err) {
    console.error('Delete sale error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get sales analytics
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days

    // Total sales
    const [totalSales] = await db.execute(`
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(AVG(total), 0) as avg_sale_amount
      FROM sales 
      WHERE sale_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [period]);

    // Daily sales for chart
    const [dailySales] = await db.execute(`
      SELECT 
        DATE(sale_date) as date,
        COUNT(*) as sales_count,
        COALESCE(SUM(total), 0) as revenue
      FROM sales 
      WHERE sale_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(sale_date)
      ORDER BY date ASC
    `, [period]);

    // Top selling products
    const [topProducts] = await db.execute(`
      SELECT 
        p.product_id,
        p.name,
        SUM(si.quantity) as total_sold,
        SUM(si.subtotal) as total_revenue
      FROM sale_items si
      JOIN products p ON si.product_id = p.product_id
      JOIN sales s ON si.sale_id = s.sale_id
      WHERE s.sale_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY p.product_id, p.name
      ORDER BY total_sold DESC
      LIMIT 10
    `, [period]);

    // Sales by hour
    const [hourlySales] = await db.execute(`
      SELECT 
        HOUR(sale_date) as hour,
        COUNT(*) as sales_count,
        COALESCE(SUM(total), 0) as revenue
      FROM sales 
      WHERE sale_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY HOUR(sale_date)
      ORDER BY hour ASC
    `, [period]);

    res.json({
      summary: totalSales[0],
      daily_sales: dailySales,
      top_products: topProducts,
      hourly_sales: hourlySales
    });
  } catch (err) {
    console.error('Get sales analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent sales
exports.getRecentSales = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [rows] = await db.execute(`
      SELECT 
        s.sale_id,
        s.user_id,
        u.name as customer_name,
        s.sale_date,
        s.total,
        COUNT(si.sale_item_id) as item_count
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.user_id
      LEFT JOIN sale_items si ON s.sale_id = si.sale_id
      GROUP BY s.sale_id, s.user_id, u.name, s.sale_date, s.total
      ORDER BY s.sale_date DESC
      LIMIT ?
    `, [limit]);

    res.json(rows);
  } catch (err) {
    console.error('Get recent sales error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
