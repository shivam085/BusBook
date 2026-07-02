const Razorpay = require('razorpay');
const crypto = require('crypto');
const { ApiError } = require('../utils');

class PaymentService {
  constructor() {
    this.key_id = process.env.RAZORPAY_KEY_ID || 'mock_key_id';
    this.key_secret = process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret';
    
    this.isMockMode = this.key_id === 'mock_key_id';

    if (!this.isMockMode) {
      this.razorpay = new Razorpay({
        key_id: this.key_id,
        key_secret: this.key_secret,
      });
    }
  }

  async createOrder(amount, receipt) {
    if (this.isMockMode) {
      return {
        id: `order_mock_${crypto.randomBytes(6).toString('hex')}`,
        amount: amount * 100, // Razorpay uses paise
        currency: 'INR',
        receipt,
        status: 'created',
        notes: { mock: true }
      };
    }

    try {
      const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit
        currency: 'INR',
        receipt,
      };
      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Razorpay Error:', error);
      throw new ApiError(500, 'Failed to create payment order');
    }
  }

  verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature) {
    if (this.isMockMode) {
      // In mock mode, we just accept anything
      return true;
    }

    try {
      const text = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', this.key_secret)
        .update(text.toString())
        .digest('hex');

      return expectedSignature === razorpay_signature;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new PaymentService();
