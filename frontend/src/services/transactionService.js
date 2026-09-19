import api from "./api";


export const getMyTransactions = async () => {

  const response = await api.get(
    "/api/transactions/my"
  );

  return response.data;
};