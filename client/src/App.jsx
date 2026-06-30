import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchResults from './pages/SearchResults';
import SeatSelection from './pages/SeatSelection';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import Wallet from './pages/Wallet';
import Dashboard from './pages/admin/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<SearchResults />} />

              <Route path="/trips/:id/seats" element={
                <ProtectedRoute><SeatSelection /></ProtectedRoute>
              } />
              <Route path="/booking" element={
                <ProtectedRoute><BookingPage /></ProtectedRoute>
              } />
              <Route path="/bookings" element={
                <ProtectedRoute><MyBookings /></ProtectedRoute>
              } />
              <Route path="/wallet" element={
                <ProtectedRoute><Wallet /></ProtectedRoute>
              } />

              <Route path="/admin/*" element={
                <AdminRoute><Dashboard /></AdminRoute>
              } />

              <Route path="*" element={
                <div className="text-center py-20">
                  <h1 className="text-3xl font-bold text-gray-800">404</h1>
                  <p className="text-gray-500 mt-2">Page not found</p>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
