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

export const downloadTicket = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}/ticket`, {
    responseType: 'blob', // Important for handling binary PDF data
  });
  
  // Create a blob link to download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Ticket-${bookingId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
