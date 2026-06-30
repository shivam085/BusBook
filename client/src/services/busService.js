import api from './api';

export const getBuses = async () => {
  const { data } = await api.get('/buses');
  return data.data; // Because of our ApiResponse format
};

export const createBus = async (busData) => {
  const { data } = await api.post('/buses', busData);
  return data.data;
};

export const deleteBus = async (id) => {
  await api.delete(`/buses/${id}`);
};
