const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ApiError } = require('../utils');

class AuthService {
  generateAccessToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    });
  }

  generateRefreshToken(id) {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    });
  }

  // Returns both tokens as a pair
  generateTokens(id) {
    return {
      accessToken: this.generateAccessToken(id),
      refreshToken: this.generateRefreshToken(id),
    };
  }

  async registerUser(name, email, password) {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      throw new ApiError(400, 'User already exists');
    }

    const user = await User.create({ name, email, password, role: 'user' });

    const tokens = this.generateTokens(user.id);

    // Store hashed refresh token in DB
    user.refreshToken = tokens.refreshToken;
    await user.save({ hooks: false });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async loginUser(email, password) {
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const tokens = this.generateTokens(user.id);

    user.refreshToken = tokens.refreshToken;
    await user.save({ hooks: false });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async refreshAccessToken(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token is required');
    }

    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await User.findByPk(decoded.id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token is invalid or has been revoked');
    }

    // Rotate tokens
    const tokens = this.generateTokens(user.id);
    user.refreshToken = tokens.refreshToken;
    await user.save({ hooks: false });

    return tokens;
  }

  async logoutUser(userId) {
    const user = await User.findByPk(userId);
    if (user) {
      user.refreshToken = null;
      await user.save({ hooks: false });
    }
  }

  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role'],
    });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
}

module.exports = new AuthService();
