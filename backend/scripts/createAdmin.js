// Usage: node createAdmin.js
const db = require('../db');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const name = 'Admin';
    const email = 'admin@grocerdesk.local';
    const password = 'Admin@123'; // change immediately after creating
    const role = 'admin';

    const [rows] = await db.execute('SELECT * FROM staff WHERE email = ?', [email]);
    if (rows.length) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const [result] = await db.execute('INSERT INTO staff (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashed, role]);
    console.log('Admin created:', email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
