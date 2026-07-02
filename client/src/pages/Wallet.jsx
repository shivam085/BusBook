import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { addFunds, verifyWalletPayment } from '../services/walletService';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Wallet = () => {
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) < 100) {
      setError('Minimum amount to add is ₹100');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const order = await addFunds(Number(amount));

      // Mock Mode bypass (if no API keys are provided in .env)
      if (order.notes && order.notes.mock) {
        alert('Mock Payment Mode: Simulating successful top-up...');
        
        const res = await verifyWalletPayment({
          amount: Number(amount),
          razorpay_order_id: order.id,
          razorpay_payment_id: 'pay_mock_wallet_' + Math.random().toString(36).substring(7),
          razorpay_signature: 'mock_signature_valid'
        });

        updateUser({ walletBalance: res.walletBalance });
        setSuccess(`Successfully added ₹${amount} to your wallet!`);
        setAmount('');
        setLoading(false);
        return;
      }

      // Load Razorpay Script (Real Mode)
      const resLoad = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!resLoad) {
        alert('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }

      // Store the amount before Razorpay opens (closure-safe)
      const topUpAmount = Number(amount);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_xxxxxx',
        amount: order.amount,
        currency: order.currency,
        name: 'BusBooking Wallet',
        description: 'Wallet Top-up',
        order_id: order.id,
        handler: async function (response) {
          try {
            setLoading(true);
            const res = await verifyWalletPayment({
              amount: topUpAmount,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            updateUser({ walletBalance: res.walletBalance });
            setSuccess(`Successfully added ₹${topUpAmount} to your wallet!`);
            setAmount('');
            setLoading(false);
          } catch (verifyErr) {
            console.error('Wallet verification error:', verifyErr);
            setError(verifyErr.response?.data?.message || 'Payment verification failed!');
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#2563eb'
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        setError('Payment Failed! ' + response.error.description);
        setLoading(false);
      });

      paymentObject.open();
      setLoading(false); // Allow the user to interact while modal is open
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate top-up.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Wallet</h1>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl overflow-hidden mb-8 text-white p-8">
        <p className="text-blue-100 mb-2">Available Balance</p>
        <h2 className="text-5xl font-bold">₹{user?.walletBalance || 0}</h2>
        <div className="mt-8 pt-6 border-t border-blue-500/30 flex justify-between items-center opacity-80 text-sm font-mono">
          <span>{user?.name?.toUpperCase() || 'USER'}</span>
          <span>BUSBOOK SECURE PAY</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Add Funds</h3>
        
        {error && <div className="mb-4 text-red-600 text-sm p-3 bg-red-50 rounded-md">{error}</div>}
        {success && <div className="mb-4 text-green-600 text-sm p-3 bg-green-50 rounded-md">{success}</div>}
        
        <form onSubmit={handleAddFunds}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Amount (₹)</label>
            <input 
              type="number"
              min="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="e.g. 500"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : 'Proceed to Add Funds'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Wallet;
