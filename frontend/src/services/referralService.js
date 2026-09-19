import api from "./api";

/**
 * Get referral summary for the
 * currently authenticated user.
 */
export const getReferralSummary = async () => {
  const response = await api.get(
    "/api/referrals/summary"
  );

  return response.data;
};

export const getReferralLink = async () => {
  const response = await api.get(
    "/api/referrals/link"
  );

  return response.data;
};