import { useState, useEffect } from 'react';
import { getMyBookings } from '../services/bookingService';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getMyBookings();
        setBookings(data);
      } catch (err) {
        setError('Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <div className="text-center py-10">Loading your bookings...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <p className="text-gray-500 mb-4 text-lg">You haven't booked any trips yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col md:flex-row">
              {/* Left Side: Status & QR Placeholder */}
              <div className="bg-blue-50 w-full md:w-48 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
                <span className={`px-4 py-1 rounded-full text-sm font-semibold mb-4 
                  ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {booking.status.toUpperCase()}
                </span>
                <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs">QR Code</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 font-mono">ID: #{booking.id}</p>
              </div>

              {/* Right Side: Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{booking.trip.bus.busNumber}</h3>
                      <p className="text-gray-500">{booking.trip.bus.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Journey Date</p>
                      <p className="font-bold text-gray-900">{booking.trip.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-gray-700 mb-4">
                    <div className="flex-1">
                      <p className="font-semibold">Origin</p>
                      <p className="text-sm">{booking.trip.departureTime}</p>
                    </div>
                    <div className="text-gray-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-semibold">Destination</p>
                      <p className="text-sm">{booking.trip.estimatedArrivalTime}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-2 flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-500">Seats</p>
                    <p className="font-bold">{booking.seatNumbers.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Amount Paid</p>
                    <p className="font-bold text-lg text-blue-600">₹{booking.totalAmount}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
