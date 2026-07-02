const { walletService } = require('../services');
const { ApiResponse, ApiError } = require('../utils');

class WalletController {
  /**
   * Initialize a wallet top-up by creating a Razorpay order
   */
  addFunds = async (req, res, next) => {
    try {
      const { amount } = req.body; // Amount in INR

      if (!amount || amount <= 0) {
        throw new ApiError(400, 'Invalid amount for top-up');
      }

      const order = await walletService.createTopUpOrder(req.user.id, amount);
      
      res.status(200).json(
        new ApiResponse(200, 'Top-up order created successfully', order)
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify top-up payment and update balance
   */
  verifyPayment = async (req, res, next) => {
    try {
      const { amount, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!amount || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ApiError(400, 'Missing payment details for verification');
      }

      const newBalance = await walletService.verifyAndAddFunds(
        req.user.id,
        Number(amount),
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      res.status(200).json(
        new ApiResponse(200, 'Wallet recharged successfully', { walletBalance: newBalance })
      );
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new WalletController();
