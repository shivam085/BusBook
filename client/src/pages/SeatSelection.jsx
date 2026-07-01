import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getTripSeats } from '../services/tripService';
import { useAuth } from '../context/AuthContext';

const SeatSelection = () => {
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const data = await getTripSeats(tripId);
        setTrip(data.trip);
        setBookedSeats(data.bookedSeats || []);
      } catch (err) {
        setError('Failed to load seat availability');
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [tripId]);

  const toggleSeat = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) return;
    
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      if (selectedSeats.length >= 6) {
        alert('You can only book up to 6 seats at once');
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handleProceed = () => {
    if (!isAuthenticated) {
      // Save intent to local storage so we can resume after login
      localStorage.setItem('pendingBooking', JSON.stringify({
        tripId, selectedSeats, origin, destination
      }));
      navigate('/login?redirect=checkout');
      return;
    }
    // Phase 6: Navigate to checkout/booking confirmation
    alert(`Proceeding to checkout with seats: ${selectedSeats.join(', ')}`);
  };

  if (loading) return <div className="text-center py-10">Loading seat map...</div>;
  if (error || !trip) return <div className="text-center py-10 text-red-500">{error || 'Trip not found'}</div>;

  const capacity = trip.bus.capacity;
  const seats = Array.from({ length: capacity }, (_, i) => i + 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Trip Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{trip.bus.busNumber}</h1>
          <p className="text-gray-600">{trip.bus.type} • {origin} to {destination}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-600">Departure</p>
          <p className="text-xl font-bold">{trip.date} at {trip.departureTime}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left: Seat Map */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6 text-center">Select Your Seats</h2>
          
          <div className="flex justify-center mb-8 gap-6">
            <div className="flex items-center gap-2"><div className="w-6 h-6 border rounded bg-white"></div> Available</div>
            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-blue-500"></div> Selected</div>
            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-gray-300"></div> Booked</div>
          </div>

          <div className="max-w-md mx-auto bg-gray-50 p-8 rounded-xl border-2 border-gray-200">
            {/* Driver Wheel Icon representation */}
            <div className="flex justify-end mb-8">
              <div className="text-gray-400 text-2xl">🚌 Driver</div>
            </div>

            {/* Seat Grid - Simulated 2x2 with aisle */}
            <div className="grid grid-cols-5 gap-y-4 gap-x-2">
              {seats.map((seatNum, index) => {
                const isBooked = bookedSeats.includes(seatNum);
                const isSelected = selectedSeats.includes(seatNum);
                
                // Add aisle gap (index % 4 === 2)
                const isAisle = (index % 4 === 2);

                return (
                  <div key={seatNum} className="flex gap-2">
                    {isAisle && <div className="w-8"></div> /* Aisle spacer */}
                    
                    <button
                      disabled={isBooked}
                      onClick={() => toggleSeat(seatNum)}
                      className={`
                        w-12 h-12 rounded flex items-center justify-center font-medium transition-colors
                        ${isBooked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 
                          isSelected ? 'bg-blue-500 text-white shadow-md' : 
                          'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-500'}
                      `}
                    >
                      {seatNum}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Booking Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border h-fit sticky top-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Booking Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Price:</span>
              <span>₹{trip.basePrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Selected Seats:</span>
              <span className="font-medium">{selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-3 border-t">
              <span>Total Amount:</span>
              <span>₹{selectedSeats.length * trip.basePrice}</span>
            </div>
          </div>

          <button
            disabled={selectedSeats.length === 0}
            onClick={handleProceed}
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedSeats.length === 0 ? 'Select a seat to continue' : 'Proceed to Book'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SeatSelection;
