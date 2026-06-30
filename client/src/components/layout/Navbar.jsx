import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Brand */}
          <Link to="/" className="text-xl font-bold text-blue-600">
            BusBook
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">Home</Link>

            {isAuthenticated && (
              <>
                <Link to="/bookings" className="text-gray-600 hover:text-gray-900 text-sm">My Bookings</Link>
                <Link to="/wallet" className="text-gray-600 hover:text-gray-900 text-sm">Wallet</Link>
              </>
            )}

            {isAdmin && (
              <Link to="/admin" className="text-gray-600 hover:text-gray-900 text-sm">Admin</Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">
                  {user?.name}
                  {isAdmin && (
                    <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Admin</span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">Login</Link>
                <Link to="/register" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-600 text-2xl"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-3 space-y-2 bg-white">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-600 py-1">Home</Link>

          {isAuthenticated && (
            <>
              <Link to="/bookings" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-600 py-1">My Bookings</Link>
              <Link to="/wallet" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-600 py-1">Wallet</Link>
            </>
          )}

          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-600 py-1">Admin</Link>
          )}

          <div className="pt-2 border-t">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="text-sm text-red-500">Logout ({user?.name})</button>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm text-gray-600">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block text-sm text-blue-600">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
