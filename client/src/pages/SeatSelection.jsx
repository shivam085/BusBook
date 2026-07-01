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
    // Save intent to local storage so we can resume after login or on checkout
    localStorage.setItem('pendingBooking', JSON.stringify({
      tripId, selectedSeats, origin, destination
    }));

    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
      return;
    }
    // Navigate to checkout
    navigate('/booking');
  };

  if (loading) return <div className="text-center py-20 text-xl font-medium text-gray-600">Loading premium seat map...</div>;
  if (error || !trip) return <div className="text-center py-20 text-red-500 text-xl font-medium">{error || 'Trip not found'}</div>;

  const capacity = trip.bus.capacity;
  const halfCapacity = Math.floor(capacity / 2);
  
  const lowerDeckSeats = Array.from({ length: halfCapacity }, (_, i) => i + 1);
  const upperDeckSeats = Array.from({ length: capacity - halfCapacity }, (_, i) => i + 1 + halfCapacity);

  // Dynamic pricing for visual effect: Sleepers cost 1.5x
  const getSeatPrice = (seatNum) => seatNum > halfCapacity ? trip.basePrice * 1.5 : trip.basePrice;
  const totalAmount = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      
      {/* Trip Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-8 rounded-2xl shadow-xl text-white mb-10 flex flex-col md:flex-row justify-between items-center transform transition-all hover:scale-[1.01]">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">{trip.bus.busNumber}</h1>
          <p className="text-blue-200 font-medium">{trip.bus.type} • {origin} to {destination}</p>
        </div>
        <div className="text-center md:text-right bg-white/10 px-6 py-3 rounded-xl backdrop-blur-sm">
          <p className="text-blue-200 text-sm uppercase tracking-wide">Departure</p>
          <p className="text-2xl font-bold">{trip.date}</p>
          <p className="text-lg text-blue-100">{trip.departureTime}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        
        {/* Left: Seat Map */}
        <div className="lg:col-span-2">
          
          {/* Legend */}
          <div className="bg-white p-4 rounded-xl shadow-sm border mb-8 flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-700">
            <div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-gray-300 rounded bg-white shadow-sm"></div> Available</div>
            <div className="flex items-center gap-3"><div className="w-5 h-5 rounded bg-blue-600 shadow-md ring-2 ring-blue-200 ring-offset-1"></div> Selected</div>
            <div className="flex items-center gap-3"><div className="w-5 h-5 rounded bg-gray-200 border border-gray-300 opacity-70"></div> Booked</div>
          </div>

          <div className="flex flex-col xl:flex-row gap-8 overflow-x-auto pb-4">
            {/* LOWER DECK (Sitting) */}
            <div className="bg-gray-50/50 p-6 rounded-3xl border-2 border-gray-200 shadow-inner flex-1 min-w-[300px]">
              <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 pb-4">
                <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Lower Deck</h3>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-bold">SEATER</span>
              </div>
              
              <div className="flex justify-end mb-8">
                <div className="text-gray-400 text-3xl transform -scale-x-100" title="Driver">🚍</div>
              </div>

              {/* Seater Grid: 2x2 with aisle */}
              <div className="grid grid-cols-5 gap-y-5 gap-x-3">
                {lowerDeckSeats.flatMap((seatNum, index) => {
                  const isBooked = bookedSeats.includes(seatNum);
                  const isSelected = selectedSeats.includes(seatNum);

                  const seatElement = (
                    <div key={seatNum} className="flex justify-center">
                      <button
                        disabled={isBooked}
                        onClick={() => toggleSeat(seatNum)}
                        className={`
                          relative group w-14 h-16 rounded-t-[1.25rem] rounded-b-lg flex flex-col items-center justify-center font-bold transition-all duration-300
                          ${isBooked ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed shadow-inner' : 
                            isSelected ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-xl ring-4 ring-blue-200 ring-offset-1 scale-110 z-10' : 
                            'bg-gradient-to-b from-white to-gray-50 border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:from-blue-50 hover:to-white hover:text-blue-600 hover:-translate-y-1 hover:shadow-lg'}
                        `}
                      >
                        {/* Seat Headrest */}
                        <div className={`absolute top-0 w-10 h-3 rounded-b-full shadow-sm transition-colors duration-300 ${isSelected ? 'bg-blue-300' : isBooked ? 'bg-gray-200' : 'bg-gray-200 group-hover:bg-blue-200'}`}></div>
                        
                        {/* Seat Armrests (Left & Right) */}
                        <div className={`absolute left-0 bottom-2 w-1.5 h-6 rounded-r-md transition-colors duration-300 ${isSelected ? 'bg-blue-400' : isBooked ? 'bg-gray-200' : 'bg-gray-200 group-hover:bg-blue-200'}`}></div>
                        <div className={`absolute right-0 bottom-2 w-1.5 h-6 rounded-l-md transition-colors duration-300 ${isSelected ? 'bg-blue-400' : isBooked ? 'bg-gray-200' : 'bg-gray-200 group-hover:bg-blue-200'}`}></div>

                        <span className="mt-2 text-sm">{seatNum}</span>
                      </button>
                    </div>
                  );

                  // Inject an empty grid cell for the aisle before every 3rd seat (index 2, 6, 10...)
                  if (index % 4 === 2) {
                    return [
                      <div key={`aisle-${seatNum}`} className="w-8"></div>,
                      seatElement
                    ];
                  }

                  return seatElement;
                })}
              </div>
            </div>

            {/* UPPER DECK (Sleeper) */}
            <div className="bg-gray-50/50 p-6 rounded-3xl border-2 border-gray-200 shadow-inner flex-1 min-w-[300px]">
              <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 pb-4">
                <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Upper Deck</h3>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold border border-purple-200">SLEEPER</span>
              </div>
              
              <div className="flex justify-end mb-8 opacity-0">
                <div className="text-gray-400 text-3xl">🚍</div> {/* Spacer for alignment */}
              </div>

              {/* Sleeper Grid: 1x2 with aisle (Beds take 2 rows of space vertically, we simulate with wide cells) */}
              <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                {upperDeckSeats.map((seatNum, index) => {
                  const isBooked = bookedSeats.includes(seatNum);
                  const isSelected = selectedSeats.includes(seatNum);
                  
                  // For sleepers, maybe 1 left, aisle, 1 right. Using a 4 col grid: [Bed] [Aisle] [Aisle] [Bed]
                  const isRightSide = index % 2 !== 0;

                  return (
                    <div key={seatNum} className={`flex col-span-2 ${isRightSide ? 'justify-end' : 'justify-start'}`}>
                      <button
                        disabled={isBooked}
                        onClick={() => toggleSeat(seatNum)}
                        className={`
                          relative group w-20 h-10 rounded-lg flex items-center justify-center font-bold transition-all duration-200
                          ${isBooked ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed' : 
                            isSelected ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100 scale-105 z-10' : 
                            'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:-translate-y-1 hover:shadow-md'}
                        `}
                      >
                        {/* Pillow indicator */}
                        <div className={`absolute left-1 top-1 bottom-1 w-4 rounded-md ${isSelected ? 'bg-blue-400' : isBooked ? 'bg-gray-300' : 'bg-gray-200 group-hover:bg-blue-200'}`}></div>
                        <span className="ml-2">{seatNum}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Booking Summary Cart */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 sticky top-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Your Cart
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-gray-600">
                <span>Sitting Price:</span>
                <span className="font-medium">₹{trip.basePrice}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 border-b border-gray-100 pb-4">
                <span>Sleeper Price:</span>
                <span className="font-medium text-purple-600">₹{trip.basePrice * 1.5}</span>
              </div>
              
              <div className="py-2">
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider block mb-3">Selected Seats</span>
                {selectedSeats.length === 0 ? (
                  <p className="text-gray-400 italic">No seats selected yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map(seat => (
                      <span key={seat} className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${seat > halfCapacity ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                        {seat} {seat > halfCapacity ? '(SL)' : '(ST)'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
              <div className="flex justify-between items-end">
                <span className="text-gray-500 font-medium">Total Amount</span>
                <span className="text-4xl font-black text-gray-900">₹{totalAmount}</span>
              </div>
            </div>

            <button
              disabled={selectedSeats.length === 0}
              onClick={handleProceed}
              className="w-full relative overflow-hidden group bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/30"
            >
              <span className="relative z-10">{selectedSeats.length === 0 ? 'Select a seat to continue' : 'Proceed to Checkout'}</span>
              <div className="absolute inset-0 h-full w-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite] z-0" />
            </button>
            <style jsx="true">{`
              @keyframes shine {
                100% { transform: translateX(100%) skewX(-12deg); }
              }
            `}</style>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SeatSelection;
