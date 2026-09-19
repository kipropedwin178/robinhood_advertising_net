import api from "./api";


export const getLifetimeEarnings = async () => {
  const response = await api.get(
    "/api/earnings/lifetime"
  );

  return response.data;
};