import api from "./api";


// =====================================================
// GET PAYMENT SETTINGS
// =====================================================

export const getPaymentSettings = async () => {

  const response = await api.get(
    "/api/payment-settings"
  );

  return response.data;
};