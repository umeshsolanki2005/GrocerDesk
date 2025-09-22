const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(auth);

// Get inventory overview/dashboard data
router.get('/overview', async (req, res) => {
  try {
    // Get products with category info
    const [products] = await db.execute(`
      SELECT 
        p.product_id, 
        p.name, 
        CAST(p.price AS DECIMAL(10,2)) as price, 
        CAST(p.stock AS SIGNED) as stock, 
        p.category_id,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.name ASC
    `);

    // Get categories
    const [categories] = await db.execute(
      'SELECT category_id, name FROM categories ORDER BY name ASC'
    );

    // Get low stock products (threshold = 10)
    const [lowStockProducts] = await db.execute(`
      SELECT 
        p.product_id, 
        p.name, 
        CAST(p.price AS DECIMAL(10,2)) as price, 
        CAST(p.stock AS SIGNED) as stock, 
        p.category_id,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.stock <= 10
      ORDER BY p.stock ASC
    `);

    // Calculate inventory statistics
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStock = products.filter(p => p.stock <= 10).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

    // Calculate category statistics
    const categoryStats = categories.map(cat => {
      const categoryProducts = products.filter(p => p.category_id === cat.category_id);
      const categoryTotalStock = categoryProducts.reduce((sum, p) => sum + p.stock, 0);
      const categoryTotalValue = categoryProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
      
      return {
        ...cat,
        productCount: categoryProducts.length,
        totalStock: categoryTotalStock,
        totalValue: categoryTotalValue
      };
    });

    res.json({
      products,
      categories,
      lowStockProducts,
      stats: {
        totalProducts,
        totalStock,
        lowStock,
        outOfStock,
        totalValue
      },
      categoryStats
    });
  } catch (error) {
    console.error('Get inventory overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inventory alerts
router.get('/alerts', async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    
    // Get low stock products
    const [lowStock] = await db.execute(`
      SELECT 
        p.product_id, 
        p.name, 
        p.price, 
        p.stock, 
        p.category_id,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.stock <= ? AND p.stock > 0
      ORDER BY p.stock ASC
    `, [threshold]);

    // Get out of stock products
    const [outOfStock] = await db.execute(`
      SELECT 
        p.product_id, 
        p.name, 
        p.price, 
        p.stock, 
        p.category_id,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.stock = 0
      ORDER BY p.name ASC
    `);

    res.json({
      lowStock,
      outOfStock,
      alerts: {
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length
      }
    });
  } catch (error) {
    console.error('Get inventory alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inventory movements/history
router.get('/movements', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    // Get recent sales as inventory movements
    const [movements] = await db.execute(`
      SELECT 
        si.sale_item_id as movement_id,
        'sale' as movement_type,
        p.product_id,
        p.name as product_name,
        c.name as category_name,
        si.quantity,
        si.price,
        s.sale_date as movement_date,
        CONCAT('Sale #', s.sale_id) as reference
      FROM sale_items si
      JOIN products p ON si.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      JOIN sales s ON si.sale_id = s.sale_id
      ORDER BY s.sale_date DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    res.json({
      movements,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: movements.length
      }
    });
  } catch (error) {
    console.error('Get inventory movements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update stock levels
router.put('/bulk-update', async (req, res) => {
  try {
    const { updates } = req.body; // Array of {product_id, stock, operation}
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Updates array is required' });
    }

    const results = [];
    
    for (const update of updates) {
      const { product_id, stock, operation = 'set' } = update;
      
      if (!product_id || stock === undefined) {
        continue;
      }

      // Get current stock
      const [rows] = await db.execute('SELECT stock FROM products WHERE product_id = ?', [product_id]);
      if (rows.length === 0) {
        continue;
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
        default:
          newStock = stock;
          break;
      }

      // Update stock
      await db.execute('UPDATE products SET stock = ? WHERE product_id = ?', [newStock, product_id]);
      
      results.push({
        product_id,
        old_stock: currentStock,
        new_stock: newStock,
        operation
      });
    }

    res.json({
      message: 'Bulk stock update completed',
      updated: results.length,
      results
    });
  } catch (error) {
    console.error('Bulk update stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
