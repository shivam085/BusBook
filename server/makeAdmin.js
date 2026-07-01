const { User } = require('./src/models');
const bcrypt = require('bcrypt');
require('./src/config/database');

async function seedAdmin() {
  try {
    const email = 'admin@bus.com';
    let admin = await User.findOne({ where: { email } });
    
    if (admin) {
      admin.role = 'admin';
      await admin.save();
      console.log('Existing admin@bus.com user updated to Admin role.');
    } else {
      admin = await User.create({
        name: 'Super Admin',
        email,
        password: 'password123',
        role: 'admin'
      });
      console.log('Created new Admin user: admin@bus.com / password123');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

seedAdmin();
