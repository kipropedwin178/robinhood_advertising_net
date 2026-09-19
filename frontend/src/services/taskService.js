import api from "./api";


// =========================================================
// GET ADVERTISEMENT
// =========================================================

export const getAdvertisement = async (
  membershipId
) => {

  const response = await api.get(
    `/api/tasks/advertise/${membershipId}`
  );

  return response.data;
};


// =========================================================
// START ADVERTISEMENT
// =========================================================
//
// This is called when the user actually clicks
// "Advertise Now".
//
// It does NOT give the reward.
// =========================================================

export const startAdvertisement = async (
  membershipId
) => {

  const response = await api.post(
    `/api/tasks/start/${membershipId}`
  );

  return response.data;
};


// =========================================================
// COMPLETE TASK
// =========================================================

export const completeTask = async (
  membershipId
) => {

  const response = await api.post(
    `/api/tasks/complete/${membershipId}`
  );

  return response.data;
};