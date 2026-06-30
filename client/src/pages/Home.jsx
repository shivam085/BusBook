import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!origin || !destination || !date) return;

    const params = new URLSearchParams({ origin, destination, date });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Book Bus Tickets Online</h1>
        <p className="text-gray-500 mt-2">Search, select seats, and book in minutes</p>
      </div>

      {/* Search Form */}
      <div className="max-w-3xl mx-auto bg-white border rounded-lg p-6 shadow-sm">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Origin city"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Destination city"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
          >
            Search Buses
          </button>
        </form>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        <div className="text-center p-6">
          <div className="text-3xl mb-3">🚌</div>
          <h3 className="font-semibold text-gray-800">Wide Network</h3>
          <p className="text-sm text-gray-500 mt-1">Routes connecting major cities across India</p>
        </div>
        <div className="text-center p-6">
          <div className="text-3xl mb-3">💺</div>
          <h3 className="font-semibold text-gray-800">Choose Your Seat</h3>
          <p className="text-sm text-gray-500 mt-1">Interactive seat selection with live availability</p>
        </div>
        <div className="text-center p-6">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="font-semibold text-gray-800">Secure Payments</h3>
          <p className="text-sm text-gray-500 mt-1">Razorpay-powered payments with instant confirmation</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
