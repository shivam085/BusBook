import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { searchTrips } from '../services/tripService';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (origin && destination && date) {
      fetchTrips();
    } else {
      setLoading(false);
    }
  }, [origin, destination, date]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await searchTrips(origin, destination, date);
      setTrips(data);
    } catch (error) {
      console.error('Failed to search trips', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (tripId) => {
    // We will build Seat Selection in Phase 5
    // navigate(`/seat-selection/${tripId}`);
    alert('Seat selection coming in Phase 5!');
  };

  if (loading) return <div className="p-8 text-center text-lg">Searching for buses...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white p-4 rounded shadow-sm border mb-6 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{origin} <span className="text-gray-400 font-normal mx-2">to</span> {destination}</h1>
          <p className="text-gray-600 mt-1">{new Date(date).toDateString()}</p>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 md:mt-0 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 font-medium"
        >
          Modify Search
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-20 bg-white border rounded shadow-sm">
          <h2 className="text-xl text-gray-600 font-medium mb-2">No Buses Found</h2>
          <p className="text-gray-500">We couldn't find any trips for this route on the selected date.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {trips.map(trip => (
            <div key={trip.id} className="bg-white border rounded shadow-sm p-4 flex flex-col md:flex-row justify-between items-center hover:shadow-md transition-shadow">
              
              {/* Bus Info */}
              <div className="flex-1 mb-4 md:mb-0">
                <h3 className="text-lg font-bold text-gray-800">{trip.bus?.busNumber}</h3>
                <p className="text-sm text-gray-500">{trip.bus?.type} • {trip.bus?.capacity} Seats</p>
              </div>

              {/* Timing */}
              <div className="flex-1 flex justify-center items-center gap-4 mb-4 md:mb-0 text-center">
                <div>
                  <p className="text-xl font-bold">{trip.departureTime.substring(0,5)}</p>
                  <p className="text-xs text-gray-500">{origin}</p>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-gray-300 mt-[-15px] mx-2 relative">
                  <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs bg-white px-2 text-gray-400 rounded-full border">
                    Bus Route
                  </span>
                </div>
                <div>
                  <p className="text-xl font-bold">{trip.estimatedArrivalTime.substring(0,5)}</p>
                  <p className="text-xs text-gray-500">{destination}</p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">₹{trip.basePrice}</p>
                <p className="text-sm text-gray-500 mb-4">per seat</p>
                <Link
                  to={`/book/${trip.id}?origin=${searchParams.get('origin')}&destination=${searchParams.get('destination')}`}
                  className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition-colors"
                >
                  View Seats
                </Link>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
