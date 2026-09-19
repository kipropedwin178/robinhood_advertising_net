import api from "./api";

export const createWithdrawal = async (withdrawalData) => {
  const response = await api.post(
    "/api/withdrawals",
    withdrawalData
  );

  return response.data;
};