import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTripSeats } from '../services/tripService';
import { createBooking } from '../services/bookingService';

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

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      const totalAmount = bookingIntent.selectedSeats.length * trip.basePrice;
      
      await createBooking({
        tripId: bookingIntent.tripId,
        seatNumbers: bookingIntent.selectedSeats,
        totalAmount
      });

      // Clear intent
      localStorage.removeItem('pendingBooking');
      
      // Navigate to My Bookings
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm booking. Seats may have been taken.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading checkout...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!trip || !bookingIntent) return null;

  const totalAmount = bookingIntent.selectedSeats.length * trip.basePrice;

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
                <p className="font-bold">{bookingIntent.selectedSeats.join(', ')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Price per seat</p>
                <p className="font-medium">₹{trip.basePrice}</p>
              </div>
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
            {loading ? 'Processing...' : 'Confirm & Book Tickets'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
