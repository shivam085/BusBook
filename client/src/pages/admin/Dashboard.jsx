import { useState, useEffect } from 'react';
import { getBuses, createBus, deleteBus } from '../../services/busService';

const Dashboard = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [busNumber, setBusNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [type, setType] = useState('Non-AC');
  const [routeInput, setRouteInput] = useState(''); // Comma separated

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const data = await getBuses();
      setBuses(data);
    } catch (error) {
      console.error('Failed to fetch buses');
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
      fetchBuses();
    } catch (error) {
      alert('Failed to add bus');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await deleteBus(id);
        fetchBuses();
      } catch (error) {
        alert('Failed to delete bus');
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
                          onClick={() => handleDelete(bus.id)}
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
