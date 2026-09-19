import api from "./api";


// =========================================================
// GET PAYMENT SETTINGS
// =========================================================

export const getPaymentSettings = async () => {

  const response = await api.get(
    "/api/payment-settings"
  );

  return response.data;
};


// =========================================================
// CREATE MANUAL DEPOSIT
// =========================================================

export const createDeposit = async (
  depositData
) => {

  const response = await api.post(
    "/api/deposits",
    depositData
  );

  return response.data;
};


// =========================================================
// INITIATE STK PUSH
// =========================================================

export const initiateStkPush = async (
  payload
) => {

  const response = await api.post(
    "/api/deposits/stk-push",
    payload
  );

  return response.data;
};