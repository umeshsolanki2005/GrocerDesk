const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed database...');

    // Clear existing data
    await db.execute('DELETE FROM sale_items');
    await db.execute('DELETE FROM sales');
    await db.execute('DELETE FROM products');
    await db.execute('DELETE FROM categories');
    await db.execute('DELETE FROM users');
    await db.execute('DELETE FROM staff');
    console.log('✅ Cleared existing data');

    // Create staff members
    const staffData = [
      {
        staff_id: uuidv4(),
        name: 'John Admin',
        email: 'admin@grocerdesk.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      },
      {
        staff_id: uuidv4(),
        name: 'Sarah Manager',
        email: 'manager@grocerdesk.com',
        password: await bcrypt.hash('manager123', 10),
        role: 'manager'
      },
      {
        staff_id: uuidv4(),
        name: 'Mike Cashier',
        email: 'cashier@grocerdesk.com',
        password: await bcrypt.hash('cashier123', 10),
        role: 'cashier'
      }
    ];

    for (const staff of staffData) {
      await db.execute(
        'INSERT INTO staff (staff_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [staff.staff_id, staff.name, staff.email, staff.password, staff.role]
      );
    }
    console.log('✅ Created staff members');

    // Create categories
    const categories = [
      { category_id: uuidv4(), name: 'Fruits' },
      { category_id: uuidv4(), name: 'Vegetables' },
      { category_id: uuidv4(), name: 'Dairy' },
      { category_id: uuidv4(), name: 'Meat' },
      { category_id: uuidv4(), name: 'Bakery' },
      { category_id: uuidv4(), name: 'Beverages' },
      { category_id: uuidv4(), name: 'Snacks' },
      { category_id: uuidv4(), name: 'Frozen Foods' }
    ];

    for (const category of categories) {
      await db.execute(
        'INSERT INTO categories (category_id, name) VALUES (?, ?)',
        [category.category_id, category.name]
      );
    }
    console.log('✅ Created categories');

    // Create products
    const products = [
      { product_id: uuidv4(), name: 'Red Apples', price: 2.99, stock: 50, category_id: categories[0].category_id },
      { product_id: uuidv4(), name: 'Bananas', price: 1.49, stock: 75, category_id: categories[0].category_id },
      { product_id: uuidv4(), name: 'Oranges', price: 3.99, stock: 40, category_id: categories[0].category_id },
      { product_id: uuidv4(), name: 'Carrots', price: 1.99, stock: 60, category_id: categories[1].category_id },
      { product_id: uuidv4(), name: 'Tomatoes', price: 2.49, stock: 35, category_id: categories[1].category_id },
      { product_id: uuidv4(), name: 'Lettuce', price: 1.79, stock: 25, category_id: categories[1].category_id },
      { product_id: uuidv4(), name: 'Whole Milk', price: 3.49, stock: 30, category_id: categories[2].category_id },
      { product_id: uuidv4(), name: 'Cheddar Cheese', price: 4.99, stock: 20, category_id: categories[2].category_id },
      { product_id: uuidv4(), name: 'Yogurt', price: 2.99, stock: 45, category_id: categories[2].category_id },
      { product_id: uuidv4(), name: 'Chicken Breast', price: 8.99, stock: 15, category_id: categories[3].category_id },
      { product_id: uuidv4(), name: 'Ground Beef', price: 6.99, stock: 12, category_id: categories[3].category_id },
      { product_id: uuidv4(), name: 'Fresh Bread', price: 2.29, stock: 25, category_id: categories[4].category_id },
      { product_id: uuidv4(), name: 'Croissants', price: 3.99, stock: 18, category_id: categories[4].category_id },
      { product_id: uuidv4(), name: 'Coca Cola', price: 1.99, stock: 100, category_id: categories[5].category_id },
      { product_id: uuidv4(), name: 'Orange Juice', price: 3.49, stock: 40, category_id: categories[5].category_id },
      { product_id: uuidv4(), name: 'Potato Chips', price: 2.99, stock: 60, category_id: categories[6].category_id },
      { product_id: uuidv4(), name: 'Chocolate Cookies', price: 4.49, stock: 35, category_id: categories[6].category_id },
      { product_id: uuidv4(), name: 'Frozen Pizza', price: 5.99, stock: 20, category_id: categories[7].category_id },
      { product_id: uuidv4(), name: 'Ice Cream', price: 4.99, stock: 30, category_id: categories[7].category_id }
    ];

    for (const product of products) {
      await db.execute(
        'INSERT INTO products (product_id, name, price, stock, category_id) VALUES (?, ?, ?, ?, ?)',
        [product.product_id, product.name, product.price, product.stock, product.category_id]
      );
    }
    console.log('✅ Created products');

    // Create customers
    const customers = [
      { user_id: uuidv4(), name: 'Alice Johnson', email: 'alice@email.com', phone: '555-0101', address: '123 Main St, City' },
      { user_id: uuidv4(), name: 'Bob Smith', email: 'bob@email.com', phone: '555-0102', address: '456 Oak Ave, City' },
      { user_id: uuidv4(), name: 'Carol Davis', email: 'carol@email.com', phone: '555-0103', address: '789 Pine Rd, City' },
      { user_id: uuidv4(), name: 'David Wilson', email: 'david@email.com', phone: '555-0104', address: '321 Elm St, City' },
      { user_id: uuidv4(), name: 'Eva Brown', email: 'eva@email.com', phone: '555-0105', address: '654 Maple Dr, City' }
    ];

    for (const customer of customers) {
      await db.execute(
        'INSERT INTO users (user_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
        [customer.user_id, customer.name, customer.email, customer.phone, customer.address]
      );
    }
    console.log('✅ Created customers');

    // Create some sample sales
    const sales = [
      { sale_id: uuidv4(), user_id: customers[0].user_id, total: 15.47 },
      { sale_id: uuidv4(), user_id: customers[1].user_id, total: 8.98 },
      { sale_id: uuidv4(), user_id: null, total: 12.50 }, // Walk-in customer
      { sale_id: uuidv4(), user_id: customers[2].user_id, total: 25.99 }
    ];

    for (const sale of sales) {
      await db.execute(
        'INSERT INTO sales (sale_id, user_id, total) VALUES (?, ?, ?)',
        [sale.sale_id, sale.user_id, sale.total]
      );
    }
    console.log('✅ Created sales');

    // Create sale items
    const saleItems = [
      { sale_item_id: uuidv4(), sale_id: sales[0].sale_id, product_id: products[0].product_id, quantity: 3, price: 2.99, subtotal: 8.97 },
      { sale_item_id: uuidv4(), sale_id: sales[0].sale_id, product_id: products[6].product_id, quantity: 2, price: 3.49, subtotal: 6.98 },
      { sale_item_id: uuidv4(), sale_id: sales[1].sale_id, product_id: products[1].product_id, quantity: 2, price: 1.49, subtotal: 2.98 },
      { sale_item_id: uuidv4(), sale_id: sales[1].sale_id, product_id: products[13].product_id, quantity: 3, price: 1.99, subtotal: 5.97 },
      { sale_item_id: uuidv4(), sale_id: sales[2].sale_id, product_id: products[9].product_id, quantity: 1, price: 8.99, subtotal: 8.99 },
      { sale_item_id: uuidv4(), sale_id: sales[2].sale_id, product_id: products[11].product_id, quantity: 1, price: 2.29, subtotal: 2.29 },
      { sale_item_id: uuidv4(), sale_id: sales[3].sale_id, product_id: products[7].product_id, quantity: 2, price: 4.99, subtotal: 9.98 },
      { sale_item_id: uuidv4(), sale_id: sales[3].sale_id, product_id: products[8].product_id, quantity: 3, price: 2.99, subtotal: 8.97 },
      { sale_item_id: uuidv4(), sale_id: sales[3].sale_id, product_id: products[16].product_id, quantity: 1, price: 4.49, subtotal: 4.49 }
    ];

    for (const item of saleItems) {
      await db.execute(
        'INSERT INTO sale_items (sale_item_id, sale_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [item.sale_item_id, item.sale_id, item.product_id, item.quantity, item.price, item.subtotal]
      );
    }
    console.log('✅ Created sale items');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@grocerdesk.com / admin123');
    console.log('Manager: manager@grocerdesk.com / manager123');
    console.log('Cashier: cashier@grocerdesk.com / cashier123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
};

seedData();
