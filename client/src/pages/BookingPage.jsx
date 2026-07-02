import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTripSeats } from '../services/tripService';
import { createBooking, verifyPayment } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

// Helper to load external scripts dynamically
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const BookingPage = () => {
  const navigate = useNavigate();
  const [bookingIntent, setBookingIntent] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIntentAndTrip = async () => {
      try {
        const intent = localStorage.getItem('pendingBooking');
        if (!intent) {
          navigate('/');
          return;
        }

        const parsedIntent = JSON.parse(intent);
        setBookingIntent(parsedIntent);

        // Fetch trip details to display invoice
        const data = await getTripSeats(parsedIntent.tripId);
        setTrip(data.trip);
      } catch (err) {
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    fetchIntentAndTrip();
  }, [navigate]);

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const { user, updateUser } = useAuth();

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      
      const res = await createBooking({
        tripId: bookingIntent.tripId,
        seatNumbers: bookingIntent.selectedSeats,
        totalAmount,
        paymentMethod
      });
      
      const { booking, order, paidViaWallet, newWalletBalance } = res;

      if (paidViaWallet) {
        // Wallet payment bypasses Razorpay entirely
        updateUser({ walletBalance: newWalletBalance });
        localStorage.removeItem('pendingBooking');
        navigate('/bookings');
        return;
      }

      // Mock Mode bypass (if no API keys are provided in .env)
      if (order.notes && order.notes.mock) {
        alert('Mock Payment Mode: Simulating successful payment...');
        
        try {
          await verifyPayment({
            bookingId: booking.id,
            razorpay_order_id: order.id,
            razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substring(7),
            razorpay_signature: 'mock_signature_valid'
          });
          localStorage.removeItem('pendingBooking');
          navigate('/bookings');
        } catch (verifyErr) {
          setError('Mock Payment verification failed!');
          setLoading(false);
        }
        return;
      }

      // Load Razorpay Script (Real Mode)
      const resLoad = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!resLoad) {
        alert('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }

      // Configure Razorpay Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_xxxxxx', 
        amount: order.amount,
        currency: order.currency,
        name: 'BusBooking System',
        description: 'Ticket Purchase',
        order_id: order.id,
        handler: async function (response) {
          try {
            setLoading(true);
            await verifyPayment({
              bookingId: booking.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            localStorage.removeItem('pendingBooking');
            navigate('/bookings');
          } catch (verifyErr) {
            setError('Payment verification failed!');
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || 'Test User',
          email: user?.email || 'test@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#2563eb' // Tailwind blue-600
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        alert('Payment Failed! ' + response.error.description);
        setLoading(false);
      });

      paymentObject.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate booking. Seats may have been taken.');
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading checkout...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!trip || !bookingIntent) return null;

  const halfCapacity = Math.floor(trip.bus.capacity / 2);
  const getSeatPrice = (seatNum) => seatNum > halfCapacity ? trip.basePrice * 1.5 : trip.basePrice;
  
  const totalAmount = bookingIntent.selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);
  const hasEnoughWalletBalance = user?.walletBalance >= totalAmount;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Checkout</h1>
      
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-100 text-sm">Bus Service</p>
              <h2 className="text-2xl font-bold">{trip.bus.busNumber}</h2>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Journey Date</p>
              <p className="font-semibold">{trip.date}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-8 pb-8 border-b">
            <div className="text-center flex-1">
              <h3 className="text-xl font-bold text-gray-800">{bookingIntent.origin}</h3>
              <p className="text-gray-500">{trip.departureTime}</p>
            </div>
            <div className="px-8 text-gray-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </div>
            <div className="text-center flex-1">
              <h3 className="text-xl font-bold text-gray-800">{bookingIntent.destination}</h3>
              <p className="text-gray-500">{trip.estimatedArrivalTime}</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h4 className="font-semibold text-gray-700">Passenger Details</h4>
            <div className="bg-gray-50 p-4 rounded-lg flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Selected Seats</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {bookingIntent.selectedSeats.map(seat => (
                    <span key={seat} className="font-bold">
                      {seat} {seat > halfCapacity ? '(SL)' : '(ST)'}{bookingIntent.selectedSeats.indexOf(seat) !== bookingIntent.selectedSeats.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Amount Breakdown</p>
                <p className="font-medium text-xs text-gray-400 mt-1">
                  {bookingIntent.selectedSeats.map(seat => `₹${getSeatPrice(seat)}`).join(' + ')}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-700 mb-3">Select Payment Method</h4>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="razorpay" 
                  checked={paymentMethod === 'razorpay'} 
                  onChange={() => setPaymentMethod('razorpay')}
                  className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 font-medium text-gray-800">Razorpay (Cards / UPI / NetBanking)</span>
              </label>

              <label className={`flex items-center p-4 border rounded-lg transition-colors ${hasEnoughWalletBalance ? 'cursor-pointer hover:bg-gray-50' : 'bg-gray-50 opacity-60 cursor-not-allowed'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="wallet" 
                  checked={paymentMethod === 'wallet'} 
                  onChange={() => {
                    if (hasEnoughWalletBalance) setPaymentMethod('wallet')
                  }}
                  disabled={!hasEnoughWalletBalance}
                  className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3 flex-1 flex justify-between items-center">
                  <span className="font-medium text-gray-800">Wallet Balance</span>
                  <span className={`font-bold ${hasEnoughWalletBalance ? 'text-green-600' : 'text-red-500'}`}>
                    Available: ₹{user?.walletBalance || 0}
                  </span>
                </div>
              </label>
              {!hasEnoughWalletBalance && (
                <p className="text-sm text-red-500 mt-1 ml-1">Insufficient wallet balance. Please use Razorpay or add funds to your wallet.</p>
              )}
            </div>
          </div>

          <div className="border-t pt-6 mb-8 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Total Amount Payable</h3>
            <p className="text-3xl font-bold text-blue-600">₹{totalAmount}</p>
          </div>

          <button 
            onClick={handleConfirmBooking}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            {loading ? 'Processing...' : (paymentMethod === 'wallet' ? 'Pay with Wallet & Book' : 'Confirm & Book Tickets')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
