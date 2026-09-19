import api from "./api";


/**
 * Get the wallet of the currently
 * authenticated user.
 */
export const getMyWallet = async () => {
  const response = await api.get(
    "/api/wallet"
  );

  return response.data;
};