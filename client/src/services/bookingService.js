import api from './api';

export const createBooking = async (bookingData) => {
  const { data } = await api.post('/bookings', bookingData);
  return data.data; // ApiResponse format
};

export const verifyPayment = async (paymentData) => {
  const { data } = await api.post('/bookings/verify', paymentData);
  return data.data;
};

export const getMyBookings = async () => {
  const { data } = await api.get('/bookings/my-bookings');
  return data.data;
};
