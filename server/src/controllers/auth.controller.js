const { authService } = require('../services');

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.registerUser(name, email, password);
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      const statusCode = error.message === 'User already exists' ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.loginUser(email, password);
      res.json({ success: true, ...result });
    } catch (error) {
      const statusCode = error.message === 'Invalid email or password' ? 401 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  async getMe(req, res) {
    try {
      const user = await authService.getUserById(req.user.id);
      res.json({ success: true, user });
    } catch (error) {
      const statusCode = error.message === 'User not found' ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();
