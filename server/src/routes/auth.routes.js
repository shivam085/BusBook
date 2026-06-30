const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { protect } = require('../middlewares');

// Note: Because we use classes in controllers, we must bind 'this' or use arrow functions. 
// Using .bind() ensures 'this' context is preserved.
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/me', protect, authController.getMe.bind(authController));

module.exports = router;
