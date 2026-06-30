const { User } = require('./src/models');
require('./src/config/database');

async function makeAdmin() {
  const user = await User.findOne({ where: { email: 'real@test.com' } });
  if (user) {
    user.role = 'admin';
    await user.save();
    console.log('User real@test.com is now an admin!');
  } else {
    console.log('User not found.');
  }
  process.exit(0);
}
makeAdmin();
