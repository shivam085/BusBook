import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (origin && destination && date) {
      navigate(`/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${date}`);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const CITIES = [
    'Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Hyderabad', 
    'Chennai', 'Kolkata', 'Ahmedabad', 'Goa', 'Jaipur'
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="bg-blue-600 text-white pt-20 pb-24 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Bus Tickets Online</h1>
        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
          Fast, secure, and hassle-free bus ticket booking experience with real-time seat tracking.
        </p>

        {/* Search Bar */}
        <div className="mt-10 max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg text-gray-800">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="text-left">
              <label className="block text-sm font-semibold text-gray-600 mb-1">From</label>
              <select 
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full border-b-2 border-gray-300 focus:border-blue-600 outline-none p-2 bg-white"
              >
                <option value="" disabled>Select Origin</option>
                {CITIES.map(city => (
                  <option key={`from-${city}`} value={city} disabled={city === destination}>{city}</option>
                ))}
              </select>
            </div>
            <div className="text-left">
              <label className="block text-sm font-semibold text-gray-600 mb-1">To</label>
              <select 
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full border-b-2 border-gray-300 focus:border-blue-600 outline-none p-2 bg-white"
              >
                <option value="" disabled>Select Destination</option>
                {CITIES.map(city => (
                  <option key={`to-${city}`} value={city} disabled={city === origin}>{city}</option>
                ))}
              </select>
            </div>
            <div className="text-left">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Date</label>
              <input 
                type="date" 
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border-b-2 border-gray-300 focus:border-blue-600 outline-none p-2 text-gray-700 bg-white"
              />
            </div>
            <div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded transition-colors">
                SEARCH BUSES
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="text-4xl mb-4">🚌</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Wide Network</h3>
          <p className="text-gray-500">Routes connecting major cities across India</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="text-4xl mb-4">💺</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Choose Your Seat</h3>
          <p className="text-gray-500">Interactive seat selection with live availability</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure Payments</h3>
          <p className="text-gray-500">Razorpay-powered payments with instant confirmation</p>
        </div>
      </section>
      
    </div>
  );
};

export default Home;
