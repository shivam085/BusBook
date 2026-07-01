const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { protect } = require('../middlewares');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', protect, authController.logout);

module.exports = router;
