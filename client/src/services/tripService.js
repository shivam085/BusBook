import api from './api';

export const searchTrips = async (origin, destination, date) => {
  const { data } = await api.get(`/trips/search?origin=${origin}&destination=${destination}&date=${date}`);
  return data.data; // ApiResponse format
};

export const createTrip = async (tripData) => {
  const { data } = await api.post('/trips', tripData);
  return data.data;
};

export const getTrips = async () => {
  const { data } = await api.get('/trips');
  return data.data;
};

export const deleteTrip = async (id) => {
  await api.delete(`/trips/${id}`);
};
