const { authService } = require('../services');
const { ApiResponse } = require('../utils');

class AuthController {
  register = async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const result = await authService.registerUser(name, email, password);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json(new ApiResponse(201, 'User registered successfully', {
        user: result.user,
        accessToken: result.accessToken,
      }));
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await authService.loginUser(email, password);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json(new ApiResponse(200, 'Login successful', {
        user: result.user,
        accessToken: result.accessToken,
      }));
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req, res, next) => {
    try {
      const user = await authService.getUserById(req.user.id);
      res.json(new ApiResponse(200, 'User profile', user));
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req, res, next) => {
    try {
      const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const tokens = await authService.refreshAccessToken(incomingRefreshToken);

      // Rotate the cookie as well
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json(new ApiResponse(200, 'Token refreshed successfully', {
        accessToken: tokens.accessToken,
      }));
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      await authService.logoutUser(req.user.id);
      res.clearCookie('refreshToken');
      res.json(new ApiResponse(200, 'Logged out successfully'));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AuthController();
