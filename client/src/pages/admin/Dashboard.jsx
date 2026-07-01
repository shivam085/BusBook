import { useState, useEffect } from 'react';
import { getBuses, createBus, deleteBus } from '../../services/busService';
import { getTrips, createTrip, deleteTrip } from '../../services/tripService';

const Dashboard = () => {
  const [buses, setBuses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Bus Form state
  const [busNumber, setBusNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [type, setType] = useState('Non-AC');
  const [routeInput, setRouteInput] = useState(''); 

  // Trip Form state
  const [selectedBusId, setSelectedBusId] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [basePrice, setBasePrice] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [busData, tripData] = await Promise.all([getBuses(), getTrips()]);
      setBuses(busData);
      setTrips(tripData);
      if (busData.length > 0) setSelectedBusId(busData[0].id);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    try {
      const routeArray = routeInput.split(',').map(s => s.trim()).filter(Boolean);
      await createBus({
        busNumber,
        capacity: parseInt(capacity),
        type,
        route: routeArray
      });
      // Reset form
      setBusNumber('');
      setCapacity('');
      setType('Non-AC');
      setRouteInput('');
      // Refresh list
      fetchData();
    } catch (error) {
      alert('Failed to add bus');
    }
  };

  const handleAddTrip = async (e) => {
    e.preventDefault();
    try {
      // Sequelize expects HH:mm:ss, HTML time input provides HH:mm
      const formattedDeparture = departureTime.length === 5 ? `${departureTime}:00` : departureTime;
      const formattedArrival = arrivalTime.length === 5 ? `${arrivalTime}:00` : arrivalTime;

      await createTrip({
        busId: parseInt(selectedBusId),
        date: tripDate,
        departureTime: formattedDeparture,
        estimatedArrivalTime: formattedArrival,
        basePrice: parseFloat(basePrice)
      });
      setTripDate('');
      setDepartureTime('');
      setArrivalTime('');
      setBasePrice('');
      fetchData();
    } catch (error) {
      alert('Failed to schedule trip');
    }
  };

  const handleDeleteBus = async (id) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await deleteBus(id);
        fetchData();
      } catch (error) {
        alert('Failed to delete bus');
      }
    }
  };

  const handleDeleteTrip = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteTrip(id);
        fetchData();
      } catch (error) {
        alert('Failed to delete trip');
      }
    }
  };

  if (loading) return <div className="p-4">Loading buses...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard - Manage Buses</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form to Add Bus */}
        <div className="bg-white p-6 border rounded shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-4">Add New Bus</h2>
          <form onSubmit={handleAddBus} className="flex flex-col gap-4">
            <div>
              <label className="block mb-1 font-medium">Bus Number</label>
              <input 
                required 
                value={busNumber} 
                onChange={(e) => setBusNumber(e.target.value)} 
                type="text" 
                className="w-full border p-2 rounded" 
                placeholder="MH-12-AB-1234" 
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Capacity</label>
              <input 
                required 
                value={capacity} 
                onChange={(e) => setCapacity(e.target.value)} 
                type="number" 
                className="w-full border p-2 rounded" 
                placeholder="40" 
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Bus Type</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)} 
                className="w-full border p-2 rounded"
              >
                <option value="Non-AC">Non-AC</option>
                <option value="AC">AC</option>
                <option value="Sleeper">Sleeper</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Route (comma separated)</label>
              <input 
                required 
                value={routeInput} 
                onChange={(e) => setRouteInput(e.target.value)} 
                type="text" 
                className="w-full border p-2 rounded" 
                placeholder="Mumbai, Pune, Lonavala" 
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Add Bus
            </button>
          </form>
        </div>

        {/* List of Buses */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Existing Buses</h2>
          {buses.length === 0 ? (
            <p className="text-gray-500">No buses found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3">Bus Number</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Capacity</th>
                    <th className="p-3">Route Stops</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map((bus) => (
                    <tr key={bus.id} className="border-b">
                      <td className="p-3 font-medium">{bus.busNumber}</td>
                      <td className="p-3">{bus.type}</td>
                      <td className="p-3">{bus.capacity}</td>
                      <td className="p-3">{bus.route?.join(' ➔ ')}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => handleDeleteBus(bus.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <hr className="my-12" />

      {/* TRIPS SECTION */}
      <h1 className="text-3xl font-bold mb-6">Schedule Trips</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form to Schedule Trip */}
        <div className="bg-white p-6 border rounded shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-4">New Trip</h2>
          <form onSubmit={handleAddTrip} className="flex flex-col gap-4">
            <div>
              <label className="block mb-1 font-medium">Select Bus</label>
              <select 
                value={selectedBusId} 
                onChange={(e) => setSelectedBusId(e.target.value)} 
                className="w-full border p-2 rounded"
                required
              >
                {buses.map(b => (
                  <option key={b.id} value={b.id}>{b.busNumber} ({b.route?.join(' ➔ ')})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Date</label>
              <input 
                required 
                value={tripDate} 
                onChange={(e) => setTripDate(e.target.value)} 
                type="date" 
                className="w-full border p-2 rounded" 
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1 font-medium">Departure</label>
                <input 
                  required 
                  value={departureTime} 
                  onChange={(e) => setDepartureTime(e.target.value)} 
                  type="time" 
                  className="w-full border p-2 rounded" 
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Arrival</label>
                <input 
                  required 
                  value={arrivalTime} 
                  onChange={(e) => setArrivalTime(e.target.value)} 
                  type="time" 
                  className="w-full border p-2 rounded" 
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Base Price (₹)</label>
              <input 
                required 
                value={basePrice} 
                onChange={(e) => setBasePrice(e.target.value)} 
                type="number" 
                className="w-full border p-2 rounded" 
                placeholder="500" 
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Schedule Trip
            </button>
          </form>
        </div>

        {/* List of Trips */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Scheduled Trips</h2>
          {trips.length === 0 ? (
            <p className="text-gray-500">No trips scheduled.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3">Bus</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Departure</th>
                    <th className="p-3">Arrival</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => (
                    <tr key={trip.id} className="border-b">
                      <td className="p-3 font-medium">{trip.bus?.busNumber}</td>
                      <td className="p-3">{trip.date}</td>
                      <td className="p-3">{trip.departureTime}</td>
                      <td className="p-3">{trip.estimatedArrivalTime}</td>
                      <td className="p-3">₹{trip.basePrice}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => handleDeleteTrip(trip.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
