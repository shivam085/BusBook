import api from './api';

export const addFunds = async (amount) => {
  const { data } = await api.post('/wallet/add-funds', { amount });
  return data.data;
};

export const verifyWalletPayment = async (paymentData) => {
  const { data } = await api.post('/wallet/verify', paymentData);
  return data.data;
};
