import api from "./api";


/**
 * Get all membership levels currently available
 * for new users to activate.
 */
export const getAvailableMembershipLevels = async () => {
  const response = await api.get(
    "/api/memberships/levels"
  );

  return response.data;
};


/**
 * Activate a membership level for the
 * currently authenticated user.
 */
export const activateMembership = async (level) => {
  const response = await api.post(
    `/api/memberships/activate/${level}`
  );

  return response.data;
};


/**
 * Get memberships already activated by
 * the currently authenticated user.
 */
export const getMyMemberships = async () => {
  const response = await api.get(
    "/api/memberships/my"
  );

  return response.data;
};