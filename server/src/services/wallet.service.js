const { User } = require('../models');
const paymentService = require('./payment.service');
const { ApiError } = require('../utils');

class WalletService {
  /**
   * Create a Razorpay order for adding funds
   */
  async createTopUpOrder(userId, amount) {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      throw new ApiError(400, 'Invalid top-up amount');
    }
    const order = await paymentService.createOrder(numericAmount, `receipt_wallet_${userId}_${Date.now()}`);
    return order;
  }

  /**
   * Verify the payment and add funds to the wallet
   */
  async verifyAndAddFunds(userId, amount, razorpay_order_id, razorpay_payment_id, razorpay_signature) {
    const isValid = paymentService.verifySignature(
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature
    );

    if (!isValid) {
      throw new ApiError(400, 'Invalid payment signature');
    }

    // Find the user and increment wallet balance
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.walletBalance += amount;
    await user.save();

    return user.walletBalance;
  }
}

module.exports = new WalletService();
